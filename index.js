import express from 'express';
import session from 'express-session';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));

app.use('/users', userRoutes);
app.use('/products', productRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
