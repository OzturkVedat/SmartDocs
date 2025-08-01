const { body, validationResult } = require("express-validator");

const { registerUser, loginUser } = require("../services/auth.service");

exports.register = async (req, res) => {
  await body("name").notEmpty().withMessage("Name is required.").run(req);
  await body("email").isEmail().withMessage("Valid email is required.").run(req);
  await body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long.").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const user = await registerUser(req.body);
    return res.status(201).json({ message: "Registered successfully.", user });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Email is already registered." });

    console.error("Register Error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  await body("email").isEmail().withMessage("Valid email is required.").run(req);
  await body("password").notEmpty().withMessage("Password is required.").run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const result = await loginUser(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(401).json({ error: "Invalid email or password." });
  }
};
