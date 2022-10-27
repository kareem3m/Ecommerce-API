const express = require("express");
const Order = require("../models/order");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const ObjectId = require("mongoose").Types.ObjectId;
/**
 * Get all orders
 */
router.post("/", async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
});

/**
 * Places a new order.
 */
router.post("/create", async (req, res) => {
  // Creating order in the database.
  const order = await Order.create({ status: "pending" });
  res.status(201).json(order);
});

/**
 * Start checkout session
 */
router.post("/pay/:orderId", async (req, res) => {
  if (!ObjectId.isValid(req.params.orderId)) {
    return res.status(404).send("Invalid order ID");
  }

  let order = await Order.findById(req.params.orderId);

  // checking if order exists
  if (!order) {
    return res.status(404).send("Order not found");
  }

  // checking if order is paid
  if (order.status === "paid") {
    return res.status(400).send("Order paid already.");
  }

  // Starting Stripe checkout session.
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Dummy Product",
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://example.com/success",
      cancel_url: "https://example.com/cancel",
    });

    // Updating order status
    await Order.updateOne(
      { _id: req.params.orderId },
      { status: "paymentProcessing", paymentSessionId: session.id }
    );

    // Redirecting to Stripe checkout page
    res.redirect(303, session.url);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
