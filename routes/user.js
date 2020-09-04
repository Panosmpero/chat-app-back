const router = require("express").Router();
const User = require("../models/user");
const util = require("../helpers/util");
const { ErrorHandler } = require("../helpers/errorHandler");

// get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({});
    if (!users) return next();
    res.status(200).send(users);
  } catch (error) {
    res.send(error);
  }
});

// create user
router.post("/register", async (req, res, next) => {
  try {
    let { username, password } = req.body;

    // encrypt password
    let hash = await util.encryptPassword(password);
    let newUser = new User({ username, password: hash });
    let user = await newUser.save();
    if (!user) return res.send("Failed to create user");
    res.status(200).send("User created successfully");
  } catch (error) {
    res.send(
      error.code === 11000 ? (error.message = "Username in use") : error
    );
  }
});

// user signin
router.post("/signin", async (req, res, next) => {
  try {
    let { username, password } = req.body;
    let signInUser = await User.findOne({ username });
    if (!signInUser) throw new ErrorHandler(404, "User not found!");

    // check for password
    const confirmPassword = await util.confirmPassword(
      password,
      signInUser.password
    );
    if (!confirmPassword) throw new ErrorHandler(401, "Wrong Password!")
    res.status(200).send({
      username: signInUser.username,
      isAdmin: signInUser.isAdmin,
    });

  } catch (error) {
    res.send(error)
  }
});

module.exports = router;
