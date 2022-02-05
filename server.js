const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const game = require("./src/game_controller/game");
const rl = require("readline");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const port = 8000;
const server = app.listen(
  port,
  console.log(`Server is running on port: ${port} `)
);

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

const connections = [];

const availableSeats = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const playerData = new Array(9).fill(null);

const gameState = game();

io.on("connection", (socket) => {
  console.log("New client connected");
  connections.push(socket);
  socket.emit("game_state", gameState);
  const seatIndex = availableSeats.splice(
    Math.random() * availableSeats.length,
    1
  )[0];
  playerData[seatIndex] = {};
  socket.emit("seat_index", seatIndex);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    connections.splice(connections.indexOf(socket), 1);
    playerData[seatIndex] = null;
  });
});

rl.createInterface({
  input: process.stdin,
}).on("line", (input) => {
  switch (input) {
    case "connections":
      console.log("Number of connections: ", connections.length);
      break;
    case "players":
      console.log("Players data: ", playerData);
      break;
    case "seats":
      console.log("Available Seats: ", availableSeats);
      break;
  }
});
