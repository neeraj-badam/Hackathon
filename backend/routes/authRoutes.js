const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  console.log( req.body );
  const { name, email, password, phone, address } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, phone, address, role: 'user' });

  try {
    await user.save();
    res.status(201).json({ user, message: 'User registered' });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      console.log('enter if');
      return res.status(400).json({ error: "Email already exists. Please try another email." });
    }
    console.log('here');
    res.status(500).json({ error: "Internal Server Error. Please try again later." });
  }
});

// Login User
router.post('/login', async (req, res) => {
  console.log( req.body );
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log( user );
    res.json({ token, user, exists: true});
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ✅ Check if user exists
router.get("/check-user", async (req, res) => {
  try {
    const { email } = req.query;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.send({ token, existingUser });
    } else {
      return res.send({ exists: false });
    }
  } catch (error) {
    console.log( error );
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;