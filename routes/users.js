const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

/**
 * Creates a new user.
 */
router.post("/signup", async (req, res) => {
  try {
    // Getting the user input
    let { username, email, password } = req.body;

    // Validatin the user input
    if (!username || !email || !password) {
      return res.status(400).send("All inputs are required.");
    }

    // Checking if the user already exist in the database
    let existingUsername = await User.findOne({ username });
    let existingEmail = await User.findOne({ email });

    if (existingEmail || existingUsername) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Encrypting user password
    let hashedPassword = await bcrypt.hash(password, 10);

    // Creating the user in the database
    let user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generating a new token
    let token = jwt.sign({ username }, process.env.TOKEN_KEY, {
      expiresIn: "2h",
    });

    // Attaching the token to the user object
    user.token = token;

    // Returning the created user object
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

/**
 * Logs in an existing user.
 */
router.post("/login", async (req, res) => {
  try {
    // Getting the user input
    let { username, password } = req.body;

    // Validating the user input
    if (!username) {
      return res.status(400).send("Username is required.");
    }
    if (!password) {
      return res.status(400).send("Password is required.");
    }

    // Validating if the user exist in the database
    let user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generating a new token
      let token = jwt.sign({ username }, process.env.TOKEN_KEY, {
        expiresIn: "2h",
      });

      // Attaching the token to the user object
      user.token = token;

      // Returning the user object
      return res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

/**
 * Updates existing user data.
 */
router.post("/update", verifyToken, async (req, res) => {
  try {
    let username = req.decodedToken.username;
    let { email, password } = req.body;
    if (email) {
      await User.updateOne({ username }, { email });
    }
    if (password) {
      let hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ username }, { password: hashedPassword });
    }
    res.status("201").json({ message: "Update successful" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
