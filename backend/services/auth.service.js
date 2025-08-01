const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/hash.util");

const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";

const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("E-posta zaten kayıtlı.");

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Kullanıcı bulunamadı.");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Error("Şifre hatalı.");

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

  return { token, user: { id: user._id, name: user.name, email: user.email } };
};

module.exports = { registerUser, loginUser };
