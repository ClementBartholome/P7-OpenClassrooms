const emailValidator = (req, res, next) => {
  const { email } = req.body; // Extract the email from the request body
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.match(emailRegex)) {
    // If email is missing or does not match the regular expression
    return res.status(400).json({ error: "Adresse mail invalide" });
  }

  return next();
};

module.exports = emailValidator;
