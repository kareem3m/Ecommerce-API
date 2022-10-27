const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const bodyParser = require("body-parser");

const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log(err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object;

    if (event.type === "checkout.session.completed") {
      Order.updateOne({ paymentSessionId: session.id }, { status: "paid" });
    } else {
      Order.updateOne(
        { paymentSessionId: session.id },
        { status: "paymentFailed" }
      );
    }

    response.status(200);
  }
);

module.exports = router;