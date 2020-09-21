const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
require("dotenv").config();

const userRouter = require("./routes/user");
const {
  formatWelcome,
  formatJoin,
  formatMessage,
  emitChannelData,
} = require("./helpers/util");

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
let connectedUsers = {};
let socketChannel = {};
let bot = "Bercord Bot";

io.on("connection", (socket) => {
  console.log("connect");
  emitChannelData(io, null, connectedUsers, socketChannel);
  // ===============================================================
  // On join channel
  // ===============================================================
  socket.on("join channel", (data) => {
    console.log("join channel");
    // create user data
    const user = {
      id: socket.id,
      username: data.username,
      channel: data.channel,
    };

    // add user
    connectedUsers[data.channel] = connectedUsers[data.channel]
      ? [...connectedUsers[data.channel], user]
      : [user];

    socketChannel[socket.id] = data.channel;

    // add user to channel
    socket.join(user.channel);

    // well met user!
    socket.emit("message", formatWelcome(bot, user.channel));

    // let everyone know about the user that connected
    socket.broadcast
      .to(user.channel)
      .emit("message", formatJoin(user.username, bot));

    // send channel data to all
    emitChannelData(io, user.channel, connectedUsers, socketChannel);
  });

  // ===============================================================
  // Get message from user and emit back to all users in channel
  // ===============================================================
  socket.on("sent message", ({ message, channel }) => {
    const user = connectedUsers[channel].find((user) => user.id === socket.id);
    io.to(user.channel).emit("message", formatMessage(user.username, message));
  });

  // ===============================================================
  // On leave channel
  // ===============================================================
  socket.on("leave channel", () => {
    console.log("leave channel");
    const ch = socketChannel[socket.id];
    const userLeft = connectedUsers[ch].find((user) => user.id === socket.id);
    connectedUsers[ch] = connectedUsers[ch].filter((user) => user !== userLeft);
    socketChannel[socket.id] = "";
    socket.leave(userLeft.channel);
    io.to(userLeft.channel).emit(
      "message",
      formatMessage(bot, `${userLeft.username} has left the channel`)
    );

    // send channel data to all
    emitChannelData(io, userLeft.channel, connectedUsers, socketChannel);
  });

  // ===============================================================
  // On disconnect
  // ===============================================================
  socket.on("disconnect", () => {
    console.log("disconnect");
    const ch = socketChannel[socket.id];
    // find user and remove from connected users array
    if (ch) {
      const userLeft = connectedUsers[ch].find((user) => user.id === socket.id);
      connectedUsers[ch] = connectedUsers[ch].filter((user) => user !== userLeft);
      delete socketChannel[socket.id];
      io.to(userLeft.channel).emit(
        "message",
        formatMessage(bot, `${userLeft.username} has left the channel`)
      );
  
      // send channel data to all
      emitChannelData(io, userLeft.channel, connectedUsers, socketChannel);
    }
  });
});

// routes
app.use("/api/user", userRouter);

// listener
server.listen(port, () => console.log(`Listening on port ${port}`));
