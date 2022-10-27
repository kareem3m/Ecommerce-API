const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIP_API_KEY);
const Order = require("../models/order")

const endpointSecret = process.env.END_POINT_SECRET;

router.post("/webhook", (request, response) => {
  const sig = request.headers['stripe-signature'];

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.log(err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Fulfill the purchase...
    Order.updateOne({paymentSessionId:session.id}, {status:"paid"})
    console.log("Order fullfilled");
  }

  response.status(200);

});

module.exports = router;
