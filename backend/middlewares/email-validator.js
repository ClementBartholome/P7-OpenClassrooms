const emailValidator = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !email.match(emailRegex)) {
    return res.status(400).json({ error: "Adresse mail invalide" });
  }
  return next();
};

module.exports = emailValidator;
