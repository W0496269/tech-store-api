import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all products
router.get('/all', async (req, res) => {
  const products = await prisma.product.findMany();
  res.status(200).json(products);
});

// Get product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({ where: { product_id: Number(id) } });
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.status(200).json(product);
});

// Purchase product
router.post('/purchase', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
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
    invoice_total
  } = req.body;

  const cartItems = cart.split(',').map(Number);

  try {
    const newPurchase = await prisma.purchase.create({
      data: {
        customer_id: req.session.user.customer_id,
        street,
        city,
        province,
        country,
        postal_code,
        credit_card,
        credit_expire,
        credit_cvv,
        invoice_amt,
        invoice_tax,
        invoice_total,
      }
    });

    const purchaseItems = cartItems.map((product_id) => ({
      purchase_id: newPurchase.purchase_id,
      product_id,
      quantity: 1 // Assuming quantity is 1 for each product_id in cart for simplicity
    }));

    await prisma.purchaseItem.createMany({ data: purchaseItems });

    res.status(200).json({ message: 'Purchase successful', purchase_id: newPurchase.purchase_id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;
