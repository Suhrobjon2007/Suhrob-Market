const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB ulanish
mongoose.connect('mongodb://127.0.0.1:27017/suhrob_market', {
  useNewUrlParser: true, useUnifiedTopology: true
});

// Foydalanuvchi modeli
const User = mongoose.model('User', new mongoose.Schema({
  phone: String,
  name: String,
  avatar: String,
  code: String,
  verified: Boolean
}));

// Multer — avatar yuklash
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Ro‘yxatdan o‘tish
app.post("/api/register", upload.single("avatar"), async (req, res) => {
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const user = new User({
    phone: req.body.phone,
    name: req.body.name,
    avatar: req.file?.filename,
    code,
    verified: false
  });
  await user.save();
  res.json({ code }); // SMS emas, demo
});

// Kodni tekshirish
app.post("/api/verify", async (req, res) => {
  const { phone, code } = req.body;
  const user = await User.findOne({ phone });
  if (user && user.code === code) {
    user.verified = true;
    await user.save();
    res.json({ message: "Tasdiq muvaffaqiyatli!" });
  } else {
    res.status(400).json({ message: "Xato kod!" });
  }
});

app.listen(PORT, () => console.log("Server http://localhost:" + PORT));
