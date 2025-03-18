class CommandExecutor {
  constructor(gameState, rl, socket) {
    this.gameState = gameState;
    this.rl = rl;
    this.socket = socket;
  }

  printHelp() {
    const commands = [
      ["h | help", "Show this help message"],
      ["(empty) | c | check", "Check if no one has bet"],
      ["(empty) | c | call", "Match the current bet"],
      ["b | bet <amount>", "Place a bet (use 'min' or 'max' for limits)"],
      ["r | raise <amount>", "Raise the bet (use 'min' or 'max' for limits)"],
      ["a | all", "Go all-in with your money (or maximum raise / bet)"],
      ["f | fold", "Fold your hand"],
      ["e | exit", "Exit the game"],
      ["t | chat <message>", "Send a message in chat"],
      ["fill_bots", "Fill the room with bots"],
      ["add_bot", "Add a bot to the room"],
      ["set_blind <big blind> <increment>", "Set the big blind and increment"],
      ["set_starter <amount>", "Set the starter stack (for new players that join the table)"],
      ["start", "Force start the game"],
      ["color", "Toggle colorful mode"],
    ];

    console.log("Commands:");
    commands.forEach(([cmd, desc]) => {
      console.log(`  ${cmd.padEnd(20)} - ${desc}`);
    });

    this.rl.prompt();
  }

  printAvailableActions() {
    const { availableActions, currentBetSize } = this.gameState;
    console.log("Available actions:");
    availableActions.forEach((action) => {
      if (action.type === "raise" || action.type === "bet") {
        const minSize = action.minSize + currentBetSize;
        const maxSize = action.maxSize + currentBetSize;
        console.log(`- ${action.type}: min ${minSize}, max ${maxSize}`);
      } else {
        console.log(`- ${action.type}`);
      }
    });
  }

  execute(input) {
    let [cmd, ...args] = input.split(" ");
    const { gameState, rl, socket } = this;

    // READY (empty)
    if ((cmd === "") && !gameState.isPlaying) {
      if (gameState.getHero().ready) {
        console.log("You are already ready.");
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: "ready" });
      return;
    }

    // Convert short CMDs to full length
    if (cmd.length === 1) {
      cmd = {
        h: "help",
        c: "check/call",
        b: "bet",
        r: "raise",
        a: "allin",
        f: "fold",
        e: "exit",
        t: "chat",
      }[cmd];
    }

    // HELP
    if (cmd === "help") {
      this.printHelp();
      return;
    }

    // CHECK / CALL
    if (cmd === "check" || cmd === "call" || cmd === "check/call" || cmd === "") {
      if (!gameState.isHeroTurn()) {
        console.log("It is not your turn.");
        rl.prompt();
        return;
      }
      let matchingAction = gameState.availableActions.find(
        (action) => action.type === cmd
      );
      if (cmd === "check/call" | cmd === "")
        matchingAction = gameState.availableActions.find(
          (action) => action.type === "check" || action.type === "call"
        );
      if (!matchingAction) {
        console.log("Invalid action.");
        this.printAvailableActions();
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: matchingAction.type });
      return;
    }

    // BET / RAISE
    if (cmd === "bet" || cmd === "raise") {
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
      let amount = args[0];
      const minSize = matchingAction.minSize + gameState.currentBetSize;
      const maxSize = matchingAction.maxSize + gameState.currentBetSize;
      if (!amount) {
        if (minSize === maxSize)
          amount = minSize;
        else {
          console.log(
            `Provide an amount between min=${minSize} and max=${maxSize}.`
          );
          rl.prompt();
          return;
        }
      }
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
          `Amount must be between min=${minSize} and max=${maxSize}.`
        );
        rl.prompt();
        return;
      }
      const convertedAmount = parseInt(amount) - gameState.currentBetSize;
      if (
        convertedAmount < matchingAction.minSize ||
        convertedAmount > matchingAction.maxSize
      ) {
        console.log(
          `Amount must be between min=${minSize} and max=${maxSize}.`
        );
        rl.prompt();
        return;
      }
      socket.emit("player_action", { type: cmd, size: convertedAmount });
      return;
    }

    // ALLIN
    if (cmd === "all") {
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
    const directCmds = ["add_bot", "fill_bots", "start", "set_blind", "set_starter"]
    if (directCmds.includes(cmd)) {
      socket.emit("chat_message", `/${cmd} ${args.join(" ")}`);
      return;
    }

    // EXIT
    if (cmd === "exit") {
      rl.close();
      socket.disconnect();
      return;
    }

    if (cmd === "color") {
      gameState.colorful = !gameState.colorful;
      console.log(`Colorful mode is set to ${gameState.colorful}`)
      rl.prompt();
      return;
    }

    console.log("Invalid command.");
    this.printHelp();
    rl.prompt();
  }
}

export default CommandExecutor;
