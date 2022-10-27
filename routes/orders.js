const express = require("express");
const order = require("../models/order");
const Order = require("../models/order");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const ObjectId = require("mongoose").Types.ObjectId;
/**
 * Pagination of orders
 */
router.get("/", async (req, res) => {
  let limit = req.query.limit;
  let after_id = req.query.after_id || ObjectId(0);
  let status = req.query.status;
  let orders;
  if (status) {
    orders = await Order.find({ status, _id: { $gt: after_id } }).limit(limit);
  } else {
    orders = await Order.find({ _id: { $gt: after_id } }).limit(limit);
  }
  if (limit && orders.length >= limit) {
    let next = `${process.env.BASE_URL}/order/?limit=${limit}&after_id=${
      orders[orders.length - 1].id
    }`;
    if (status) {
      next += `&status=${status}`;
    }
    return res.status(200).json({ next, orders });
  }
  return res.status(200).json({ orders });
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
 * Deleted a pending order.
 */
router.post("/delete/:orderId", async (req, res) => {
  try {
    // Creating order in the database.
    if (!ObjectId.isValid(req.params.orderId)) {
      return res.status(404).send("Invalid order ID");
    }

    let order = await Order.findById(req.params.orderId);

    // checking if order exists
    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (order.status === "pending") {
      await Order.deleteOne({ _id: order.id });
      return res.status(201).send("Order deleted");
    } else {
      return res.status(400).send("Can't delete non-pending order");
    }
  } catch (err) {
    return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
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
      success_url: process.env.BASE_URL + "/payment-success",
      cancel_url: process.env.BASE_URL + "/payment-cancel",
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
