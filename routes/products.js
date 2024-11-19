import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

//This route handler retrieves all products from the database using Prisma's findMany method
router.get('/all', async (req, res) => {
  const products = await prisma.product.findMany();
  res.status(200).json(products);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { product_id: Number(id) } });
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.status(200).json(product);
});

router.post('/purchase', (req, res) => {
  // Handle product purchase logic
  res.status(200).send('Product purchased');
});

export default router;
