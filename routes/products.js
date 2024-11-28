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
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ error: 'Must be authorized.' });
  }

  const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart, invoice_amt, invoice_tax, invoice_total } = req.body;
  const customer_id = req.session.user.customer_id;

  try {
    // Split the cart string into an array of product IDs
    const cartItems = cart.split(',').map(Number);
    const productQuantity = {}; // Object to store quantity of each product

    // Count each product in the cart
    cartItems.forEach((productId) => {
      if (!productQuantity[productId]) {
        productQuantity[productId] = 0;
      }
      productQuantity[productId]++;
    });

    // Get the unique product IDs
    const uniqueProductIds = Object.keys(productQuantity).map(Number);

    // Check if all product IDs exist in the products table
    const products = await prisma.product.findMany({
      where: {
        product_id: {
          in: uniqueProductIds,
        },
      },
    });

    // Check if the products returned match the unique product IDs
    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: 'One or more products in the cart are invalid' });
    }

    // Create a new purchase
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
        invoice_amt,
        invoice_tax,
        invoice_total,
      },
    });

    // Prepare purchase items with product quantities
    const purchaseItems = uniqueProductIds.map(productId => ({
      purchase_id: purchase.purchase_id,
      product_id: productId,
      quantity: productQuantity[productId],
    }));

    // Create purchase items in the database
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
