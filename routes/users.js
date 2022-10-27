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
    const { username, email, password } = req.body;

    // Validatin the user input
    if (!username || !email || !password) {
      res.status(400).send("All inputs are required.");
    }

    // Checking if the user already exist in the database
    const existingUsername = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingEmail || existingUsername) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Encrypting user password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating the user in the database
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Generating a new token
    const token = jwt.sign({ username }, process.env.TOKEN_KEY, {
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
    const { username, password } = req.body;

    // Validating the user input
    if (!username) {
      res.status(400).send("Username is required.");
    }
    if (!password) {
      res.status(400).send("Password is required.");
    }

    // Validating if the user exist in the database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Generating a new token
      const token = jwt.sign({ username }, process.env.TOKEN_KEY, {
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
    const username = req.decodedToken.username;
    const { email, password } = req.body;
    if (email) {
      await User.updateOne({ username }, { email });
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.updateOne({ username }, { password: hashedPassword });
    }
    res.status("201").json({ message: "Update successful" });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
