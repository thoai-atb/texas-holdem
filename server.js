const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const createGame = require("./src/game_controller/game");
const rl = require("readline");
const { generateBotName } = require("./src/game_controller/utils");
const path = require("path");
const { randomId } = require("./src/utils/random_id");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "./client/build")));

const port = process.env.PORT || 8000;
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
var chatLogging = true;

const game = createGame(broadcast, infoFunction, playGameSoundFx);

function broadcast() {
  io.sockets.emit("game_state", game.state);
}

function infoFunction(desc, content) {
  io.sockets.emit("chat_message", {
    desc,
    content,
  });
}

function playGameSoundFx(sound) {
  if (["bet", "call", "raise"].includes(sound)) {
    io.sockets.emit("sound_effect", "chips");
  }
  if (["check"].includes(sound)) {
    io.sockets.emit("sound_effect", "tap");
  }
  if (["fold"].includes(sound)) {
    io.sockets.emit("sound_effect", "throw");
  }
  if (["showdown"].includes(sound)) {
    io.sockets.emit("sound_effect", "win");
  }
  if (["flip"].includes(sound)) {
    io.sockets.emit("sound_effect", "flip");
  }
}

io.on("connection", (socket) => {
  // CONNECTION
  const name = socket.handshake.query.name;
  const info = `${name} joined the table`;
  io.sockets.emit("chat_message", {
    desc: info,
    content: info,
  });
  console.log(info);
  connections.push(socket);

  // SELECT SEAT
  var seatIndex = game.randomAvailableSeat();
  if (seatIndex === -1) {
    game.clearBots();
    seatIndex = game.randomAvailableSeat();
  }
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
    const info = `${name} left the table`;
    console.log(info);
    io.sockets.emit("chat_message", {
      desc: info,
      content: info,
    });
    connections.splice(connections.indexOf(socket), 1);
    playerData[seatIndex] = null;
    availableSeats.push(seatIndex);
    game.removePlayer(seatIndex);
    if (playerData.every((player) => player === null)) {
      console.log("No players left");
      // Object.assign(game, createGame(broadcast, infoFunction, playGameSoundFx));
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
          game.bet(action.size);
          broadcast();
        }
        break;
      case "raise":
        if (seatIndex === game.state.turnIndex) {
          game.raise(action.size);
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

  // CHAT
  socket.on("chat_message", (message) => {
    if (message[0] === "/") {
      const command = message.slice(1);
      executeCommand(command, name);
      return;
    }
    const chat = `<${name}> ${message}`;
    if (chatLogging) console.log(chat);
    io.sockets.emit("chat_message", {
      id: randomId(),
      desc: chat,
      content: message,
      senderID: seatIndex,
    });
  });
});

const executeCommand = (command, invoker = "Server") => {
  let isAction;
  const args = command.split(" ");
  const action = args[0];
  const arg = args.slice(1).join(" ");

  switch (action) {
    case "broadcast":
      isAction = true;
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
      isAction = true;
      for (let i = 0; i < 9; i++) {
        if (playerData[i] === null) {
          game.addBot(generateBotName());
        }
      }
      broadcast();
      break;
    case "add_bot":
      isAction = true;
      game.addBot(generateBotName());
      broadcast();
      break;
    case "clear_bots":
      isAction = true;
      game.clearBots();
      broadcast();
      break;
    case "clear":
      isAction = true;
      game.removeBrokePlayers();
      broadcast();
    case "start":
      isAction = true;
      game.checkToStart();
      break;
    case "toggle_chat_log":
      isAction = true;
      chatLogging = !chatLogging;
      break;
    case "toggle_bot_speed":
      isAction = true;
      game.state.botSpeed = 1000 - game.state.botSpeed;
      break;
    case "kick":
      isAction = true;
      game.removePlayerByName(arg);
      broadcast();
    case "toggle_debug":
      isAction = true;
      game.state.debugMode = !game.state.debugMode;
      broadcast();
      break;
    case "support":
      isAction = true;
      game.fillMoney(arg);
      broadcast();
      break;
    case "set_blind":
      isAction = true;
      game.setBlinds(parseInt(arg));
      broadcast();
      break;
    default:
      return;
  }
  const info = `${invoker}: ${command}`;
  io.sockets.emit("chat_message", {
    desc: info,
    content: command,
  });
  console.log(info);
};

rl.createInterface({
  input: process.stdin,
}).on("line", executeCommand);
