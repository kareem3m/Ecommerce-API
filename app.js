require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);

require("./config/database").connect();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Logic goes here

module.exports = app;
