require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const verifyToken = require("./middleware/verifyToken");
const webhook = require("./routes/webhook")

const app = express();

app.use(logger("dev"));
app.use(webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/user', usersRouter);
app.use(verifyToken)
app.use('/order', ordersRouter)

require("./config/database").connect();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Logic goes here

module.exports = app;
