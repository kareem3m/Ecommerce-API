
const stripe = require('stripe')(process.env.STRIPE_API_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const express = require("express");
const router = express.Router();

const bodyParser = require('body-parser');

const fulfillOrder = (session) => {
  console.log("Fulfilling order", session);
}

router.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
  const payload = request.body;
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.log(err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Fulfill the purchase...
    fulfillOrder(session);
  }

  response.status(200);
});

module.exports = router;
