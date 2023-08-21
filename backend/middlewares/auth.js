const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Extract the token from the Authorization header (Bearer Token)
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token using the key stored in process.env.TOKEN
    const decodedToken = jwt.verify(token, process.env.TOKEN);

    // Extract the userId from the decoded token and add it to the request object
    const { userId } = decodedToken;
    req.auth = {
      userId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
