const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("order", orderSchema);