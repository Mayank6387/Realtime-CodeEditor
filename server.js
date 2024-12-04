const express = require("express");
const app = express();
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server); //new Server instance based on server

const userSocketMap = {}; //for mapping individual socketid with unique usernames

function getAllConnectedClients(roomId) {
  // Map
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("join", {
        //backend to frontend
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.in(roomId).emit("code-change", { code }); //backend to frontend
  });

  socket.on("sync-code", ({ code, socketId }) => {
    io.to(socketId).emit("code-change", { code }); //backend to frontend
  });

  socket.on("disconnecting", () => {
    //The disconnecting event is triggered before the connection is fully closed.
    //At this point, you can still access active rooms or states.
    //It is for notifying all users that particular socket is leaving
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        //It is for disconnect the socket
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave(); //It is used to remove a socket (client) from a specific room it has joined.
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
