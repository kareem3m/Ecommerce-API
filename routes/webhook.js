const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const bodyParser = require("body-parser");

const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (request, response) => {
    let payload = request.body;
    let sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
      console.log(err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    let session = event.data.object;

    if (event.type === "checkout.session.completed") {
      console.log("Payment session completed.");
      await Order.updateOne(
        { paymentSessionId: session.id },
        { status: "paid" }
      );
    } else {
      console.log("Payment session failed.");
      await Order.updateOne(
        { paymentSessionId: session.id },
        { status: "paymentFailed" }
      );
    }

    response.status(200).send();
  }
);

module.exports = router;
