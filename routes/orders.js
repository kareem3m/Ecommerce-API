const express = require("express");
const Order = require("../models/order");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

/**
 * Places a new order.
 */
router.post("/create", async (req, res, next) => {
  // Creating order in the database.
  const order = await Order.create({ status: "pending" });

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
    order.status = "paymentProcessing";
    order.paymentSessionId = session.id;
    await order.save();

    // Redirecting to Stripe checkout page
    res.redirect(303, session.url);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
