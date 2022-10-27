const express = require("express");
const router = express.Router();

/**
 * Routes to get redirected to from Stripe checkout session
 */

router.get("/payment-success", async (req, res) => {
  res.status(200).send("Payment processed successfully.");
});

router.get("/payment-cancel", async (req, res) => {
    res.status(200).send("Payment canceled.");
  });

module.exports = router;