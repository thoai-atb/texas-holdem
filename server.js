const express = require("express");
const socket = require("socket.io");
const cors = require("cors");
const createGame = require("./src/game_controller/game");
const rl = require("readline");
const { generateBotName } = require("./src/game_controller/utils");
const path = require("path");
const { randomId } = require("./src/utils/random_id");
const fs = require("fs");
const ini = require("ini");
const { parseIniStringToNumber } = require("./src/utils/ini_converter");

// Read the INI configuration file
const configFile = path.join(__dirname, "./server.ini");
const config = ini.parse(fs.readFileSync(configFile, "utf-8"));
parseIniStringToNumber(config);

// Express app
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.static(path.join(__dirname, "./client/build")));

const port = config.Server.PORT;

// Start server
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
const playerData = new Array(config.Game.MAX_PLAYERS).fill(null);
var chatLogging = true;

// Init game
const game = createGame(
  (onUpdate = broadcast),
  (onStatisticsUpdate = broadcastStatistics),
  (onSettingsUpdate = broadcastSettings),
  (onInfo = broadcastInfo),
  (onSoundEffect = playGameSoundFx),
  (onPlayerKicked = kickSocketPlayerEvent),
  (onChat = chatEvent),
  (onEndRound = endRoundEvent),
  (onGameStartCountDown = gameStartCountDownEvent),
  (onTurnTimeOutCountDown = turnTimeOutCountDownEvent),
  (gameConfig = config.Game)
);

// Update game state for all clients
function broadcast() {
  io.sockets.emit("game_state", game.state);
}

function broadcastStatistics() {
  io.sockets.emit("game_statistics", game.statistics);
}

function broadcastSettings() {
  io.sockets.emit("game_settings", game.settings);
}

function broadcastInfo(desc) {
  io.sockets.emit("chat_message", {
    desc, // to store inside chat logs
  });
}

function chatEvent(name, message, seatIndex) {
  const chat = `<${name}> ${message}`;
  if (chatLogging) console.log(chat);
  io.sockets.emit("chat_message", {
    id: randomId(),
    desc: chat,
    content: message,
    senderID: seatIndex,
  });
}

function kickSocketPlayerEvent(seatIndex) {
  const socket = connections.find(
    (socket) => socket.id === playerData[seatIndex]?.socketId
  );
  if (socket) {
    socket.emit("disconnect_reason", "You were kicked");
    console.log(`Player in seat ${seatIndex} was kicked.`);
  }
}

function endRoundEvent() {
  io.sockets.emit("sound_effect", "chipsCollect");
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data", { recursive: true });
  }
  fs.writeFileSync(
    `data/${config.Server.SAVE_FILE}`,
    JSON.stringify(game.getData(), null, 2),
    "utf8"
  );
}

function gameStartCountDownEvent(seconds) {
  io.sockets.emit("game_start_count_down", seconds);
}

function turnTimeOutCountDownEvent(seconds) {
  io.sockets.emit("turn_time_out_count_down", seconds);
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
  if (["all_in_claps"].includes(sound)) {
    io.sockets.emit("sound_effect", "claps");
  }
  if (["flip"].includes(sound)) {
    io.sockets.emit("sound_effect", "flip");
  }
  if (["donate"].includes(sound)) {
    io.sockets.emit("sound_effect", "donate");
  }
}

// On connection, assign callbacks to socket to handle events
io.on("connection", (socket) => {
  // NAME
  const name = socket.handshake.query.name.trim();

  if (game.nameExisted(name)) {
    socket.emit(
      "disconnect_reason",
      `Name "${name}" was taken by players in the table`
    );
    return;
  }

  // SELECT SEAT
  var seatIndex = game.randomAvailableSeat();
  var savedData = game.getHumanPlayerData(name);
  if (savedData && game.getAvailableSeats().includes(savedData.seatIndex))
    seatIndex = savedData.seatIndex;
  var appendedInfo = "";
  if (seatIndex === -1) {
    const removedBot = game.removeBotForNewPlayerJoin();
    if (removedBot === null) {
      const info = `${name} wanted to join the table but table was full`;
      broadcastInfo(info);
      console.log(info);
      socket.emit("disconnect_reason", "Table was full");
      return;
    }
    seatIndex = removedBot.seatIndex;
    appendedInfo = ` by kicking out bot ${removedBot.name}`;
  }

  // CONNECTION
  let info = `${name} joined the table${appendedInfo}`;
  broadcastInfo(info);
  io.sockets.emit("sound_effect", "playerJoin");
  console.log(info);
  connections.push(socket);

  playerData[seatIndex] = {
    seatIndex,
    name,
    socketId: socket.id,
  };
  game.addHumanPlayer(seatIndex, name);
  broadcast();
  socket.on("info_request", () => {
    socket.emit("seat_index", seatIndex);
    socket.emit("game_state", game.state);
    socket.emit("game_statistics", game.statistics);
    socket.emit("game_settings", game.settings);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    const info = `${name} left the table`;
    console.log(info);
    io.sockets.emit("chat_message", {
      desc: info,
      content: info,
    });
    io.sockets.emit("sound_effect", "playerExit");
    connections.splice(connections.indexOf(socket), 1);
    playerData[seatIndex] = null;
    game.removePlayer(seatIndex);
    if (playerData.every((player) => player === null)) {
      console.log("No players left");
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
      case "begin-work":
        game.setWorking(seatIndex, true);
        broadcast();
        break;
      case "leave-work":
        game.setWorking(seatIndex, false);
        broadcast();
        break;
      case "finish-work":
        game.setWorking(seatIndex, false);
        game.addMoney(name, 1000);
        game.earnTimesWorked(seatIndex);
        var info = `${name} worked hard and earned $1000`;
        var response = `${name}: ${action.response}`;
        broadcastInfo(info);
        broadcastInfo(response);
        console.log(info);
        console.log(response);
        broadcast();
        break;
      case "donate":
        var info = game.donate(name, action.target, action.amount);
        broadcastInfo(info);
        console.log(info);
        broadcast();
        break;
      default:
        break;
    }
  });

  // CHAT - received chat message from client
  socket.on("chat_message", (message) => {
    if (message[0] === "/") {
      // Is command?
      const command = message.slice(1);
      result = executeCommand(command, name);
      if (result) {
        // if there's a private return result, inform invoker as well
        socket.emit("chat_message", {
          desc: `${name}: ${command}`,
        });
        socket.emit("chat_message", {
          desc: result,
        });
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
  SetBlind: "set_blind",
  ToggleAutoFillBots: "auto_fill_bots",
  SetTheme: "set_theme",
};

// COMMANDS - DEVELOPERS
const devCommands = {
  HelpDev: "help_dev",
  GetState: "state",
  GetStatistics: "stats",
  Broadcast: "broadcast",
  Connections: "connections",
  Players: "players",
  Seats: "seats",
  Start: "start",
  ToggleChatLogs: "chat_log",
  ToggleBotSpeed: "bot_speed",
  ToggleDebug: "debug",
  ToggleLimit: "limit",
  SetMoney: "set_money",
  SetStarterStack: "set_starter",
  Exit: "exit",
  LoadGame: "load_game",
};

// Commands execution - returns a string to be displayed on player's chat if exists
const executeCommand = (command, invoker = "Server") => {
  let informCommand = false; // true if display the commmand to all players
  let informResponse = ""; // response to send to all players
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
    case devCommands.GetState:
      return `Game state: ${JSON.stringify(game.state, null, 2)}`;
    case devCommands.GetStatistics:
      return `Game statistics: ${JSON.stringify(game.statistics, null, 2)}`;
    case devCommands.Connections:
      return `Number of connections: ${connections.length}`;
    case devCommands.Players:
      return `Players data: ${JSON.stringify(game.state.players, null, 2)}`;
    case devCommands.Seats:
      return `Available seats: ${game.getAvailableSeats()}`;
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
      informResponse = `Chat logging is set to ${chatLogging}`;
      break;
    case devCommands.ToggleBotSpeed:
      informCommand = true;
      game.settings.botSpeed = 1000 - game.settings.botSpeed;
      informResponse = `Bot speed is set to ${game.settings.botSpeed}`;
      break;
    case devCommands.ToggleDebug:
      informCommand = true;
      game.settings.debugMode = !game.settings.debugMode;
      informResponse = `Debug mode is set to ${game.settings.debugMode}`;
      broadcastSettings();
      break;
    case devCommands.ToggleLimit:
      informCommand = true;
      game.settings.limitGame = !game.settings.limitGame;
      informResponse = `Limit game is set to ${game.settings.limitGame}`;
      broadcast();
      break;
    case devCommands.SetMoney:
      if (!arg) {
        game.setMoney(invoker, 0);
      } else {
        const params = arg.split(" ");
        if (params.length === 1) game.setMoney(invoker, parseInt(params[0]));
        else game.setMoney(params[1], parseInt(params[0]));
      }
      informCommand = true;
      broadcast();
      break;
    case devCommands.SetStarterStack:
      if (!arg) game.setStarterStack(2000);
      else game.setStarterStack(parseInt(arg));
      informCommand = true;
      broadcast();
      break;
    case devCommands.LoadGame:
      try {
        game.setData(
          JSON.parse(fs.readFileSync(`data/${config.Server.SAVE_FILE}`))
        );
        io.disconnectSockets();
      } catch (err) {
        errStr = err.message;
        console.log(errConsoleString);
        return errStr;
      }
      break;
    case devCommands.Exit:
      process.exit();

    // === Execute player command === //
    case playerCommands.Help:
      return "Player commands: " + Object.values(playerCommands).join(", ");
    case playerCommands.FillBots:
      informCommand = true;
      game.fillBots();
      broadcast();
      break;
    case playerCommands.AddBot:
      informCommand = true;
      game.addBot(generateBotName());
      broadcast();
      break;
    case playerCommands.ToggleAutoFillBots:
      informCommand = true;
      game.settings.endRoundAutoFillBots = !game.settings.endRoundAutoFillBots;
      informResponse = `Auto fill bots is set to ${game.settings.endRoundAutoFillBots}`;
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
      // if (game.state.playing) {
      //   errStr = "This command can only be used while not playing";
      //   console.log(errConsoleString);
      //   return errStr;
      // }
      if (!game.removePlayerByName(arg)) {
        errStr = `Could not kick player with name ${arg}`;
        console.log(errConsoleString);
        return errStr;
      }
      informCommand = true;
      broadcast();
      break;
    case playerCommands.SetBlind:
      informCommand = true;
      if (!arg) game.setBlinds(10);
      else if (arg === "max") game.setBlindAllIn();
      else {
        const params = arg.split(" ");
        if (params.length === 1) game.setBlinds(parseInt(params[0]));
        else game.setBlinds(parseInt(params[0]), parseInt(params[1]));
      }
      broadcast();
      break;
    case playerCommands.SetTheme:
      informCommand = true;
      if (!arg) game.settings.gameTheme = "default";
      else game.settings.gameTheme = arg;
      informResponse = `Game theme is set to ${game.settings.gameTheme}`;
      broadcastSettings();
      break;
    default:
      console.log(errConsoleString);
      return "Invalid command: " + action;
  }

  // Send info to chat
  if (informCommand) {
    broadcastInfo(info);
    if (informResponse) broadcastInfo(informResponse);
  }
  return "";
};

// Execute command from server's console
rl.createInterface({
  input: process.stdin,
}).on("line", (command) => {
  result = executeCommand(command);
  if (result) console.log(`-> ${result}`);
});
