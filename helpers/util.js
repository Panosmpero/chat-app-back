const bcrypt = require("bcrypt");
const saltRounds = 14;

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const confirmPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = { encryptPassword, confirmPassword }