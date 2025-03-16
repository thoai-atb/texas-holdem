import GameState from "./classes/GameState.js";
import { getSocket } from "./socket.js";
import readline from "readline";
import CommandExecutor from "./classes/CommandExecutor.js";

const serverAddr = process.env.TEXAS_SERVER || "http://localhost:40143";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> ",
});

const initSocket = (playerName, serverAddr) => {
  const socket = getSocket(playerName, serverAddr);
  const gameState = new GameState();

  socket.on("connect", () => {
    console.log(`Connected to server: ${serverAddr}`);
  });

  socket.on("connect_error", () => {
    console.log(`Could not connect to server: ${serverAddr}`);
    rl.close();
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected from server ${serverAddr}`);
    rl.close();
  });

  socket.on("disconnect_reason", (disconnectReason) => {
    console.log("Server: " + disconnectReason);
    socket.disconnect();
    rl.close();
  });

  socket.on("game_state", (state) => {
    gameState.updateState(state);
    if (gameState.updatePrintedState()) {
      console.log(gameState.printedState);
      rl.prompt(true);
    }
  });

  socket.on("chat_message", (msg) => {
    gameState.updateMessage(msg.desc);
    if (gameState.updatePrintedState()) {
      console.log(gameState.printedState);
      rl.prompt(true);
    }
  });

  socket.on("game_start_count_down", (time) => {
    if (time < 0) gameState.updateMessage("");
    else gameState.updateMessage(`GAME START: ${time}`);
    if (gameState.updatePrintedState()) {
      console.log(gameState.printedState);
      rl.prompt(true);
    }
  });

  socket.on("seat_index", (index) => {
    gameState.updateHeroIndex(index);
  });

  socket.emit("info_request");

  return { socket, gameState };
};

rl.question("Enter your name: ", (name) => {
  const { socket, gameState } = initSocket(name, serverAddr);
  const commandExecutor = new CommandExecutor(gameState, rl, socket);
  rl.on("line", (command) => {
    commandExecutor.execute(command);
  });
});
