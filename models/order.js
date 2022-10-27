const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  paymentSessionId: {
    type: String,
  },
});

module.exports = mongoose.model("order", orderSchema);
