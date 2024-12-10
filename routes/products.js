import express from 'express';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client to interact with the database
const prisma = new PrismaClient();
const router = express.Router();

// Route to get all products
router.get('/all', async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await prisma.product.findMany();
    res.status(200).json(products); // Send products as JSON response
  } catch (error) {
    // If an error occurs, return a 500 status code with an error message
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Route to get product by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate if the provided ID is a valid number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid product id' }); // If invalid, return a 400 status with an error message
  }

  try {
    // Fetch the product with the given ID from the database
    const product = await prisma.product.findUnique({
      where: { product_id: Number(id) }, // Use the product_id field to query the product
    });

    // If product is not found, return a 404 status code with an error message
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If found, return the product data as JSON response
    res.status(200).json(product);
  } catch (error) {
    // If any error occurs while fetching the product, return a 500 status code
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Route to handle purchase
router.post('/purchase', async (req, res) => {
  // Check if the user is authenticated by checking the session
  if (!req.session.user) {
    return res.status(401).json({ error: 'Must be authorized.' }); // If not logged in, return 401 Unauthorized
  }

  // Destructure required fields from the request body for purchase
  const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart } = req.body;
  const customer_id = req.session.user.customer_id; // Get customer ID from the session

  try {
    // Split the cart items (comma-separated) and convert them into numbers (product IDs)
    const cartItems = cart.split(',').map(Number);
    const productQuantity = {}; // Object to store product quantity in the cart

    // Count the quantity of each product in the cart
    cartItems.forEach(productId => {
      if (!productQuantity[productId]) {
        productQuantity[productId] = 0;
      }
      productQuantity[productId]++; // Increment the quantity for each product ID
    });

    // Get unique product IDs from the cart
    const uniqueProductIds = Object.keys(productQuantity).map(Number);

    // Fetch the products with the IDs that were added to the cart
    const products = await prisma.product.findMany({
      where: {
        product_id: {
          in: uniqueProductIds, // Query for products whose IDs are in the cart
        },
      },
    });

    // If some products are not found, return a 400 status with an error message
    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: 'One or more products in the cart are invalid' });
    }

    // Create a new purchase record in the database
    const purchase = await prisma.purchase.create({
      data: {
        customer_id, // Associate the purchase with the customer
        street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart,
      },
    });

    // Prepare the purchase items data (product ID and quantity for each product in the cart)
    const purchaseItems = uniqueProductIds.map(productId => ({
      purchase_id: purchase.purchase_id,
      product_id: productId,
      quantity: productQuantity[productId],
    }));

    // Create multiple purchase items in the database to store the products in the purchase
    await prisma.purchaseItem.createMany({
      data: purchaseItems,
    });

    // Respond with a success message and the details of the purchase
    res.status(201).json({
      message: 'Purchase completed successfully',
      purchase_id: purchase.purchase_id,
      items: purchaseItems,
    });
  } catch (error) {
    console.error('Error completing purchase:', error); // Log any errors for debugging
    // If an error occurs, return a 500 status with an error message
    res.status(500).json({ error: 'Failed to complete purchase' });
  }
});

// Export the router to be used in the app
export default router;
