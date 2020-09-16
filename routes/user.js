const router = require("express").Router();
const User = require("../models/user");
const util = require("../helpers/util");
const { handleError } = require("../helpers/errorHandler");

// get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) handleError(res, 404, "Users not found");
    res.status(200).send(users);

  } catch (error) {
    handleError(res, error.code, error.message);
  }
});

// create user
router.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;

    // encrypt password
    let hash = await util.encryptPassword(password);

    let newUser = new User({ username, password: hash });
    let user = await newUser.save();
    if (!user) return handleError(res, 401, "Failed to create user");
    res.status(200).send("User created successfully");

  } catch (error) {
    error.code === 11000
      ? handleError(res, 400, "Username in use!")
      : handleError(res, error.code, error.message);
  }
});

// user signin
router.post("/signin", async (req, res) => {
  try {
    let { username, password } = req.body;
    let signInUser = await User.findOne({ username });
    if (!signInUser) return handleError(res, 404, "User not found!");

    // check for password
    const confirmPassword = await util.confirmPassword(
      password,
      signInUser.password
    );
    if (!confirmPassword) return handleError(res, 401, "Wrong Password!");
    res.status(200).send({
      username: signInUser.username,
      isAdmin: signInUser.isAdmin,
    });

  } catch (error) {
    handleError(res, error.code, error.message);
  }
});

module.exports = router;
