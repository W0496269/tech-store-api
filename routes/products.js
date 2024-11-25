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
    res.status(401).json({ error: 'Must be authorized.' });
    return;
  }

  const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart, invoice_amt, invoice_tax, invoice_total } = req.body;
  const customer_id = req.session.user.customer_id; // Accessing customer_id from session

  try {
    // Split the cart string into an array of product IDs
    const productIds = cart.split(',').map(Number);

    // Check if all product IDs exist in the products table
    const products = await prisma.product.findMany({
      where: {
        product_id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
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
// Prepare purchase items
const purchaseItems = productIds.reduce((acc, productId) => {
  const existingItem = acc.find(item => item.product_id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    acc.push({ purchase_id: purchase.purchase_id, product_id: productId, quantity: 1 });
  }
  return acc;
}, []);

// Create purchase items
await prisma.purchaseItem.createMany({
  data: purchaseItems,
});

res.status(201).json({ message: 'Purchase completed successfully', purchaseItems });
} catch (error) {
console.error('Error completing purchase:', error);
res.status(500).json({ error: 'Failed to complete purchase' });
}
});

export default router;
