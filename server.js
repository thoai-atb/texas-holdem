const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const createGame = require("./src/game_controller/game");
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

const game = createGame();

function broadcast() {
  io.sockets.emit("game_state", game.state);
}

io.on("connection", (socket) => {
  // CONNECTION
  console.log("New client connected");
  connections.push(socket);

  // SELECT SEAT
  const seatIndex = availableSeats.splice(
    Math.random() * availableSeats.length,
    1
  )[0];
  playerData[seatIndex] = {
    seatIndex,
    socketId: socket.id,
  };
  game.addPlayer(seatIndex);
  broadcast();
  socket.emit("seat_index", seatIndex);

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    connections.splice(connections.indexOf(socket), 1);
    playerData[seatIndex] = null;
    availableSeats.push(seatIndex);
    game.removePlayer(seatIndex);
    broadcast();
  });

  // PLAYER ACTION
  socket.on("player_action", (action) => {
    console.log("Player action: ", action);
    switch (action) {
      case "bet":
        if (seatIndex === game.state.turnIndex) {
          game.nextTurn();
          broadcast();
        }
        break;
      case "fold":
        break;
      case "call":
        break;
      case "raise":
        break;
      default:
        break;
    }
    if (!game.state.playing) {
      game.startGame();
      broadcast();
    }
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
    case "start":
      game.startGame();
      break;
  }
});
