const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
require("dotenv").config();

const userRouter = require("./routes/user");
const { formatWelcome, formatJoin, formatMessage } = require("./helpers/util");

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

app.use(cors());

const port = process.env.PORT || 8000;

/* 
socket.emit ME ONLY
socket.braodcast.emit EVERYONE BUT ME
io.emit ALL

connection
  join
    message       to me--socket.emit
    message       to others--socket.broadcast.emit
    data          share all--io.emit
  sent message
    message       get and share all--io.emit
disconnect
  message         share all--io.emit
  data            share all--io.emit
*/
let connectedUsers = [];
let bot = "Bercord Bot";

io.on("connection", (socket) => {
  // ===============================================================
  // On join channel
  // ===============================================================
  socket.on("join channel", (data) => {
    // create user data
    const user = {
      id: socket.id,
      username: data.username,
      channel: data.channel,
    };

    // add user to array
    connectedUsers.push(user);

    // add user to channel
    socket.join(user.channel);

    // well met user!
    socket.emit("message", formatWelcome(user.username));

    // let everyone know about the user that connected
    socket.broadcast
      .to(user.channel)
      .emit("message", formatJoin(user.username));

    // send channel data to all
    io.to(user.channel).emit("channel data", {
      channel: user.channel,
      users: connectedUsers.filter(
        (conUser) => conUser.channel === user.channel
      ),
      totalUsers: connectedUsers.length,
    });
  });

  // ===============================================================
  // Get message from user and emit back to all users in channel
  // ===============================================================
  socket.on("sent message", (message) => {
    const user = connectedUsers.find((user) => user.id === socket.id);
    io.to(user.channel).emit("message", formatMessage(user.username, message));
  });

  // ===============================================================
  // On disconnect
  // ===============================================================
  socket.on("disconnect", () => {
    // find user and remove from connected users array
    const userLeft = connectedUsers.find((user) => user.id === socket.id);
    connectedUsers = connectedUsers.filter((user) => user !== userLeft);

    if (userLeft) {
      io.to(userLeft.channel).emit(
        "message",
        formatMessage(bot, `${userLeft.username} has left the channel`)
      );

      // send channel data to all
      io.to(userLeft.channel).emit("channel data", {
        channel: userLeft.channel,
        users: connectedUsers.filter(
          (conUser) => conUser.channel === userLeft.channel
        ),
        totalUsers: connectedUsers.length,
      });
    }
  });
});

// routes
app.use("/api/user", userRouter);

// listener
server.listen(port, () => console.log(`Listening on port ${port}`));
