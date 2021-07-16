const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

exports.generateToken = (data) => {
  const token = jwt.sign(data, process.env.SECRET, {
    expiresIn: "24hr",
  });

  return token;
};

exports.decryptJWT = (token) => {
  try {
    const data = jwt.verify(token, process.env.SECRET);

    return data;
  } catch (error) {
    return "";
  }
};

exports.comparePassword = async (passwordInput, hashedPassword) => {
  const passwordMatches = await bcrypt.compare(passwordInput, hashedPassword);
  return passwordMatches;
};
