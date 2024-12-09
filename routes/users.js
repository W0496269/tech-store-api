import express from 'express';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import PasswordValidator from 'password-validator';

const prisma = new PrismaClient();
const router = express.Router();

// Session configuration
router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Use 'true' if using HTTPS
}));

// Password policy
const schema = new PasswordValidator();
schema
  .is().min(8)
  .has().uppercase()
  .has().lowercase()
  .has().digits();

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!schema.validate(password)) {
    return res.status(400).json({ error: 'Password does not meet the policy requirements' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });

    res.status(201).json({ message: 'User registered successfully', user: { email: newUser.email } });
  } catch (error) {
    console.error('Error registering user:', error);  // Log detailed error
    if (error.code === 'P2002') { // Unique constraint violation for email
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Failed to register user' });
    }
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.customer.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      customer_id: user.customer_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    };

    res.status(200).json({ message: 'Login successful', user: { email: user.email } });
  } catch (error) {
    console.error('Error during login:', error);  // Log detailed error
    res.status(500).json({ error: 'An error occurred while trying to log in' });
  }
});


// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.send('Logged out');
  });
});

// Get user session route
router.get('/getSession', (req, res) => {
  if (req.session && req.session.user) {
    const { user_id, email, first_name, last_name } = req.session.user;
    return res.status(200).json({ user_id, email, first_name, last_name });
  }
  res.status(401).json({ message: 'No active session.' });
});

export default router;
