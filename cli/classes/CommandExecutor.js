class CommandExecutor {
  constructor(gameState, rl, socket) {
    this.gameState = gameState;
    this.rl = rl;
    this.socket = socket;
  }

  printHelp() {
    console.log(`Commands:
    help: Print this help message.
    ready: Ready up for the game.
    check: Check if no one has bet.
    call: Match the current bet.
    bet <amount>|min|max: Bet the specified amount.
    raise <amount>|min|max: Raise the current bet by the specified amount.
    allin: Bet all your money.
    fold: Fold your hand.
    exit: Exit the game.
    fill_bots: Fill the room with bots.
    start: Force starting the game.
    chat <message>: Send a message to the chat.`);
    this.rl.prompt();
  }

  printAvailableActions() {
    const { availableActions } = this.gameState;
    console.log("Available actions:");
    availableActions.forEach((action) => {
      if (action.type === "raise" || action.type === "bet") {
        console.log(
          `- ${action.type}: min ${action.minSize}, max ${action.maxSize}`
        );
      } else {
        console.log(`- ${action.type}`);
      }
    });
  }

  execute(input) {
    const [cmd, ...args] = input.split(" ");
    const { gameState, rl, socket } = this;

    // HELP
    if (cmd === "help") {
      this.printHelp();
      return;
    }

    // READY
    if (cmd === "ready") {
      if (gameState.isPlaying) {
        console.log("You are already in a game.");
        rl.prompt();
        return;
      }
      if (gameState.getHero().ready) {
        console.log("You are already ready.");
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: "ready" });
      return;
    }

    // CHECK / CALL
    if (cmd === "check" || cmd === "call") {
      if (!gameState.isHeroTurn()) {
        console.log("It is not your turn.");
        rl.prompt();
        return;
      }
      const matchingAction = gameState.availableActions.find(
        (action) => action.type === cmd
      );
      if (!matchingAction) {
        console.log("Invalid action.");
        this.printAvailableActions();
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: cmd });
      return;
    }

    // BET / RAISE
    if (cmd === "bet" || cmd === "raise") {
      if (!gameState.isHeroTurn()) {
        console.log("It is not your turn.");
        rl.prompt();
        return;
      }
      const amount = args[0];
      if (!amount) {
        console.log("Please provide an amount.");
        rl.prompt();
        return;
      }
      const matchingAction = gameState.availableActions.find(
        (action) => action.type === cmd
      );
      if (!matchingAction) {
        console.log("Invalid action.");
        this.printAvailableActions();
        rl.prompt();
        return;
      }
      const minSize = matchingAction.minSize + gameState.currentBetSize;
      const maxSize = matchingAction.maxSize + gameState.currentBetSize;
      if (amount === "min") {
        socket.emit("player_action", {
          type: cmd,
          size: matchingAction.minSize,
        });
        return;
      }
      if (amount === "max") {
        socket.emit("player_action", {
          type: cmd,
          size: matchingAction.maxSize,
        });
        return;
      }
      if (isNaN(amount)) {
        console.log(
          `Amount must be between ${minSize} and ${maxSize}.`
        );
        rl.prompt();
        return;
      }
      const convertedAmount = parseInt(amount) - gameState.currentBetSize;
      if (convertedAmount < matchingAction.minSize || convertedAmount > matchingAction.maxSize) {
        console.log(
          `Amount must be between ${minSize} and ${maxSize}.`
        );
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: cmd, size: convertedAmount });
      return;
    }

    // ALLIN
    if (cmd === "allin") {
      if (!gameState.isHeroTurn()) {
        console.log("It is not your turn.");
        rl.prompt();
        return;
      }
      const matchingAction = gameState.availableActions.find(
        (action) => action.type === "raise" || action.type === "bet"
      );
      if (!matchingAction) {
        console.log("Invalid action.");
        this.printAvailableActions();
        rl.prompt();
        return;
      }
      socket.emit("player_action", {
        type: matchingAction.type,
        size: matchingAction.maxSize,
      });
      return;
    }

    // FOLD
    if (cmd === "fold") {
      if (!gameState.isHeroTurn()) {
        console.log("It is not your turn.");
        rl.prompt();
        return;
      }
      if (
        !gameState.availableActions.find((action) => action.type === "fold")
      ) {
        console.log("Invalid action.");
        this.printAvailableActions();
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: "fold" });
      return;
    }

    // CHAT
    if (cmd === "chat") {
      socket.emit("chat_message", args.join(" "));
      return;
    }

    // DIRECT COMMANDS
    if (cmd === "fill_bots" || cmd === "start") {
      socket.emit("chat_message", `/${cmd}`);
      return;
    }

    // EXIT
    if (cmd === "exit") {
      rl.close();
      socket.disconnect();
      return;
    }

    console.log("Invalid command.");
    this.printHelp();
    rl.prompt();
  }
}

export default CommandExecutor;
