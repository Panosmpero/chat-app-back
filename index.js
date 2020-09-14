const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
require("dotenv").config();
const { handleError } = require("./helpers/errorHandler");

const userRouter = require("./routes/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// // connect to DB
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
app.use(express.urlencoded({ extended: true }));

app.use(cors())

const port = process.env.PORT || 8000;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("FromAPI", new Date());

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// // routes
app.use("/api/user", userRouter);

// // listener
server.listen(port, () => console.log(`Listening on port ${port}`));