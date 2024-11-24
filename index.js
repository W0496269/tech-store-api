import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  credentials: true,
  origin: 'http://your-frontend-domain.com', // Replace with your frontend domain
}));

// Session management
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Static files route
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Use routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
