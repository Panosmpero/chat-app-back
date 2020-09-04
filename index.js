const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { handleError } = require("./helpers/errorHandler");

const userRouter = require("./routes/user");

const app = express();

// connect to DB
mongoose.connect(
  process.env.MONGO_URI,
  {
    useFindAndModify: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  (err, client) => {
    if (err) return console.log("DB error");
    console.log("DB connected");
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// routes
app.use("/api/users", userRouter);

// listener
const port = process.env.PORT || 8000;
const listener = app.listen(port, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
