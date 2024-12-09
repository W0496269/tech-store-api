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
router.post('/purchase', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Must be authorized.' });
  }

  const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart } = req.body;
  const customer_id = req.session.user.customer_id;

  try {
    const cartItems = cart.split(',').map(Number);
    const productQuantity = {};

    cartItems.forEach(productId => {
      if (!productQuantity[productId]) {
        productQuantity[productId] = 0;
      }
      productQuantity[productId]++;
    });

    const uniqueProductIds = Object.keys(productQuantity).map(Number);

    const products = await prisma.product.findMany({
      where: {
        product_id: {
          in: uniqueProductIds,
        },
      },
    });

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: 'One or more products in the cart are invalid' });
    }

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

    const purchaseItems = uniqueProductIds.map(productId => ({
      purchase_id: purchase.purchase_id,
      product_id: productId,
      quantity: productQuantity[productId],
    }));

    await prisma.purchaseItem.createMany({
      data: purchaseItems,
    });

    res.status(201).json({
      message: 'Purchase completed successfully',
      purchase_id: purchase.purchase_id,
      items: purchaseItems,
    });
  } catch (error) {
    console.error('Error completing purchase:', error);
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
});

export default router;
