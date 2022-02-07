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

const game = createGame(broadcast);

function broadcast() {
  io.sockets.emit("game_state", game.state);
}

io.on("connection", (socket) => {
  // CONNECTION
  const name = socket.handshake.query.name;
  console.log(`${name} joined the table`);
  connections.push(socket);

  // SELECT SEAT
  const seatIndex = availableSeats.splice(
    Math.random() * availableSeats.length,
    1
  )[0];
  playerData[seatIndex] = {
    seatIndex,
    name,
    socketId: socket.id,
  };
  game.addPlayer(seatIndex, name);
  broadcast();
  socket.on("info_request", () => {
    socket.emit("seat_index", seatIndex);
    socket.emit("game_state", game.state);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(`${name} left the table`);
    connections.splice(connections.indexOf(socket), 1);
    playerData[seatIndex] = null;
    availableSeats.push(seatIndex);
    game.removePlayer(seatIndex);
    if (playerData.every((player) => player === null)) {
      console.log("No players left, resetting game");
      Object.assign(game, createGame(broadcast));
    }
    broadcast();
  });

  // PLAYER ACTION
  socket.on("player_action", (action) => {
    switch (action.type) {
      case "fold":
        if (seatIndex === game.state.turnIndex) {
          game.fold();
          broadcast();
        }
        break;
      case "check":
        if (seatIndex === game.state.turnIndex) {
          game.check();
          broadcast();
        }
        break;
      case "call":
        if (seatIndex === game.state.turnIndex) {
          game.call();
          broadcast();
        }
        break;
      case "bet":
        if (seatIndex === game.state.turnIndex) {
          game.bet();
          broadcast();
        }
        break;
      case "raise":
        if (seatIndex === game.state.turnIndex) {
          game.raise();
          broadcast();
        }
        break;
      case "ready":
        game.setReady(seatIndex);
        game.checkToStart();
        broadcast();
        break;
      default:
        break;
    }
  });
});

rl.createInterface({
  input: process.stdin,
}).on("line", (input) => {
  switch (input) {
    case "broadcast":
      broadcast();
      break;
    case "connections":
      console.log("Number of connections: ", connections.length);
      break;
    case "players":
      console.log("Players data: ", playerData);
      break;
    case "seats":
      console.log("Available seats: ", availableSeats);
      break;
    case "fill_bots":
      for (let i = 0; i < 9; i++) {
        if (playerData[i] === null) {
          game.addBot("Mr. Bot");
        }
      }
      broadcast();
      break;
    case "start":
      game.checkToStart();
      break;
  }
});
