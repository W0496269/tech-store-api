import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import PasswordValidator from 'password-validator';

const prisma = new PrismaClient();
const router = express.Router();

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

  // Check for blank fields
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate password
  if (!schema.validate(password)) {
    return res.status(400).json({ error: 'Password does not meet the policy requirements' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user in the database
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

  // Check for blank fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await prisma.customer.findUnique({
      where: { email: email },
    });

    // If user is not found, return 404
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user information in the session
    req.session.user = {
      customer_id: user.customer_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // If login is successful, return the user's email
    res.status(200).json({ message: 'Login successful', email: user.email });
  } catch (error) {
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

// Get Session route
router.get('/getSession', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('No active session');
  }
  res.json(req.session.user);
});

export default router;
