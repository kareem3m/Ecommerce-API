const jwt = require("jsonwebtoken");

/**
 * Middleware for verifying and decoding the user authentication token.
 */
const verifyToken = (req, res, next) => {
  console.log(req.headers);
  let token = req.headers["user-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    let decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.decodedToken = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }

  return next();
};

module.exports = verifyToken;
