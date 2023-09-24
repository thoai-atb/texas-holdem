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

const game = createGame(broadcast, broadcastInfo, playGameSoundFx, playerKicked);

// Update game state for all clients
function broadcast() {
  io.sockets.emit("game_state", game.state);
}

function broadcastInfo(desc, content) {
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
  if (["showdown_0"].includes(sound)) {
    io.sockets.emit("sound_effect", "win");
  }
  if (["showdown_a"].includes(sound)) {
    io.sockets.emit("sound_effect", "winStrong");
  }
  if (["showdown_b"].includes(sound)) {
    io.sockets.emit("sound_effect", "winStronger");
  }
  if (["flip"].includes(sound)) {
    io.sockets.emit("sound_effect", "flip");
  }
}

function playerKicked(seatIndex) {
  const socket = connections.find(
    (socket) => socket.id === playerData[seatIndex]?.socketId
  );
  if (socket) {
    socket.disconnect();
    console.log(`Player in seat ${seatIndex} was kicked.`);
  }
}

// On connection, assign callbacks to socket to handle events
io.on("connection", (socket) => {
  // CONNECTION
  const name = socket.handshake.query.name;
  const info = `${name} joined the table`;
  broadcastInfo(info, info);
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

  // CHAT - received chat message from client
  socket.on("chat_message", (message) => {
    if (message[0] === "/") { // Is command?
      const command = message.slice(1);
      result = executeCommand(command, name);
      if (result) { // if there's a private return result, inform invoker as well
        socket.emit("chat_message", {
          desc: `${name}: ${command}`,
        })
        socket.emit("chat_message", {
          desc: result,
        })
      }
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

// COMMANDS - PLAYERS
const playerCommands = {
  Help: "help",
  FillBots: "fill_bots",
  AddBot: "add_bot",
  ClearBots: "clear_bots",
  ClearBrokes: "clear_brokes",
  Kick: "kick",
  PleaseSupport: "please_support",
  SetBlind: "set_blind"
}

// COMMANDS - DEVELOPERS
const devCommands = {
  HelpDev: "help_dev",
  Broadcast: "broadcast",
  Connections: "connections",
  Players: "players",
  Seats: "seats",
  Start: "start",
  ToggleChatLogs: "toggle_chat_log",
  ToggleBotSpeed: "toggle_bot_speed",
  ToggleDebug: "toggle_debug"
}

// Commands execution - returns a string to be displayed on player's chat if exists
const executeCommand = (command, invoker = "Server") => {
  let informCommand = false; // true if display the commmand execution to others
  const args = command.split(" ");
  const action = args[0];
  const arg = args.slice(1).join(" ");

  // Log command action
  const info = `${invoker}: ${command}`;
  console.log(info);
  const errConsoleString = "Couldn't execute command";

  // Execute command
  switch (action) {
    // === Execute dev command === //
    case devCommands.HelpDev:
      return "Developer commands: " + Object.values(devCommands).join(", ");
    case devCommands.Connections:
      return(`Number of connections: ${connections.length}`);
    case devCommands.Players:
      return(`Players data: ${JSON.stringify(playerData, null, 2)}`);
    case devCommands.Seats:
      return(`Available seats: ${availableSeats}`);
    case devCommands.Broadcast:
      informCommand = true;
      broadcast();
      break;
    case devCommands.Start:
      informCommand = true;
      game.checkToStart();
      break;
    case devCommands.ToggleChatLogs:
      informCommand = true;
      chatLogging = !chatLogging;
      break;
    case devCommands.ToggleBotSpeed:
      informCommand = true;
      game.state.botSpeed = 1000 - game.state.botSpeed;
      break;
    case devCommands.ToggleDebug:
      informCommand = true;
      game.state.debugMode = !game.state.debugMode;
      broadcast();
      break;

    // === Execute player command === //
    case playerCommands.Help:
      return "Player commands: " + Object.values(playerCommands).join(", ");
    case playerCommands.FillBots:
      informCommand = true;
      for (let i = 0; i < 9; i++) {
        if (playerData[i] === null) game.addBot(generateBotName());
      }
      broadcast();
      break;
    case playerCommands.AddBot:
      informCommand = true;
      game.addBot(generateBotName());
      broadcast();
      break;
    case playerCommands.ClearBots:
      if (game.state.playing) {
        errStr = "This command can only be used while not playing";
        console.log(errConsoleString);
        return errStr;
      }
      informCommand = true;
      game.clearBots();
      broadcast();
      break;
    case playerCommands.ClearBrokes:
      informCommand = true;
      game.removeBrokePlayers();
      broadcast();
      break;
    case playerCommands.Kick:
      if (!arg) {
        errStr = "Name not provided (ex: kick Joe)";
        console.log(errConsoleString);
        return errStr;
      }
      if (game.state.playing) {
        errStr = "This command can only be used while not playing";
        console.log(errConsoleString);
        return errStr;
      }
      if (!game.removePlayerByName(arg)) {
        errStr = `Could not kick player with name ${arg}`;
        console.log(errConsoleString);
        return errStr;
      }
      informCommand = true;
      broadcast();
    case playerCommands.PleaseSupport:
      informCommand = true;
      if (arg) game.fillMoney(arg);
      else game.fillMoney(invoker);
      broadcast();
      break;
    case playerCommands.SetBlind:
      informCommand = true;
      game.setBlinds(parseInt(arg));
      broadcast();
      break;
    default:
      console.log(errConsoleString);
      return "Invalid command: " + action;
  }

  // Send info to chat
  if (informCommand) {
    broadcastInfo(info, command);
  }
  return "";
};

// Execute command from server's console
rl.createInterface({
  input: process.stdin,
}).on("line", (command) => {
  result = executeCommand(command)
  if (result) console.log(`-> ${result}`);
});
