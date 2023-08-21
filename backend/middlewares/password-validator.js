/* eslint-disable */

const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator(); // Create a new instance of the password schema

passwordSchema
  .is()
  .min(8) // Minimum length of 8 characters
  .has()
  .uppercase() // Requires at least one uppercase letter
  .has()
  .lowercase() // Requires at least one lowercase letter
  .has()
  .digits() // Requires at least one digit
  .has()
  .not()
  .spaces(); // Does not allow spaces

module.exports = (req, res, next) => {
  const userPassword = req.body.password; // Extract the password from the request body

  if (!passwordSchema.validate(userPassword)) {
    // If the password doesn't meet the schema requirements
    console.error(
      "Erreur de validation du mot de passe:",
      passwordSchema.validate(userPassword, { list: true })
    );

    return res.status(400).json({
      error: `Mot de passe trop faible ${passwordSchema.validate(userPassword, {
        list: true,
      })}`, // Respond with an error message indicating password requirements
    });
  } else {
    next();
  }
};
