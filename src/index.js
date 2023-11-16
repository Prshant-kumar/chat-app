const path = require("path");
const http = require("http");
const express = require("express");
const Filter = require("bad-words");

require("dotenv").config({ path: path.join(__dirname, "./.env") });
const PORT = process.env.PORT || 30005;

const socketIO = require("socket.io");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utils/users.js");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));

io.on("connection", (socket) => {
  console.log("connected to socket");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }
    console.log(user);

    socket.join(user.room);

    socket.emit("message", generateMessage("Admin", "Welcome!"));

    // will emmit the event for all the other users except the connected user
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin", `${user.username} has joined`));

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
    // io.to.emit -> send message to everyone in a room,
    // sockt.broadcast.to.emit
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    console.log(user);

    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);
    console.log(user);
    const { latitude, longitude } = coords;
    const message = `${latitude},${longitude}`;
    io.to(user.room).emit(
      "locationShareMessage",
      generateLocationMessage(user.username, message)
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    // console.log(user);
    if (user) {
      console.log("disconnected");
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on port http://localhost${PORT}`);
});
