const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).send('All fields are required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });
    res.status(201).send('User signed up');
  } catch (error) {
    res.status(500).send('Error signing up');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.customer.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid email or password');
    }
    req.session.user = user;
    res.send('Logged in');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

// Get Session
router.get('/session', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No active session');
  }
  res.json(req.session.user);
});

module.exports = router;
