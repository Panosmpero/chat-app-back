const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const socket = require("./socket");

const userRouter = require("./routes/user");
const messageRoute = require("./routes/channel");

const app = express();
const server = http.createServer(app);

// // connect to DB
mongoose.connect(
  process.env.MONGO_URI,
  {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  },
  (err, client) => {
    if (err) return console.log("DB error");
    console.log("DB connected");
  }
);

// connect socket
socket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const port = process.env.PORT || 8000;

// routes
app.use("/api/user", userRouter);
app.use("/api/chat", messageRoute);

// listener
server.listen(port, () => console.log(`Listening on port ${port}`));
