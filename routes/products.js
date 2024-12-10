import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Route to get all products
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Route to get product by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate id is an integer
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product id' });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { product_id: Number(id) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Route to handle purchase
router.post('/products/purchase', authenticateToken, async (req, res) => {
  const { customer_id, street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart } = req.body;

  // Validate all required fields are provided
  if (!customer_id || !street || !city || !province || !country || !postal_code || !credit_card || !credit_expire || !credit_cvv || !cart) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const purchase = await prisma.purchase.create({
      data: {
        customer_id,
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        cart,
      },
    });
    res.status(201).json(purchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
});

module.exports = router;