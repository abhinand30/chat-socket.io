const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http").Server(app);
const PORT = 4000;

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors());
const users = {};
const rooms = {};

socketIO.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);
  // add user
  socket.on("newUser", (data) => {
    users[data] = socket.id;
    socket.data = data;
    socketIO.emit("newUserResponse", users);
    socket.emit("newRoomResponse", rooms);
  });

  socket.on("getUsers", () => {
    socket.emit("newUserResponse", users);
  });
  socket.on("getRooms", () => {
    socket.emit("newRoomResponse", rooms);
  });
  // Room
  socket.on("joinRoom", (roomId,userName) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    console.log(`${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("roomMessage", {
      sender: "System",
      message: `${userName} joined the room.`,
    });
  });

  socket.on("groupMessage", ({ sender,roomId, message }) => {
    socket.to(roomId).emit("roomMessage", { sender, message,  senderSocketID: socket.id, });
  });

  socket.on("privateMessage", ({ sender, receiverSocketId, message }) => {
    socket.to(receiverSocketId).emit("privateMessageResponse", {
      sender,
      message,
      senderSocketID: socket.id,
    });
  });

  socket.on("disconnect", () => {
    let userName=""
    for (const userId in users) {
      if (users[userId] === socket.id) {
        userName=userId
        delete users[userId];
        break;
      }
    }

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        socketIO.to(roomId).emit("roomMessage", {
          sender: "System",
          message: `${userName} left the room.`,
        });
      }
    }
    socketIO.emit("newUserResponse", users);
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
