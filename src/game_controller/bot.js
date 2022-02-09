const createBot = () => {
  const takeAction = (game, callback) => {
    const availableActions = game.state.availableActions;
    const foldAction = availableActions.filter(
      (action) => action.type === "fold"
    );
    const passiveAction = availableActions.filter(
      (action) => action.type === "check" || action.type === "call"
    );
    const agressiveAction = availableActions.filter(
      (action) => action.type === "bet" || action.type === "raise"
    );

    // CHECK IF ONLY ONE OPTION IS CHECK (ALREADY ALL IN)
    if (!foldAction.length && !agressiveAction.length) {
      if (passiveAction.length) game[passiveAction[0].type]();
      callback();
      return;
    }

    const poolOfActions = [
      ...foldAction,
      ...passiveAction,
      ...passiveAction,
      ...passiveAction,
      ...passiveAction,
      ...agressiveAction,
    ];
    const id = game.state.id;
    setTimeout(() => {
      if (game.state.id !== id) return;
      // if (!game.state.players[game.state.seatIndex]) return;
      let accepted = false;
      while (!accepted) {
        const randomAction =
          poolOfActions[Math.floor(Math.random() * poolOfActions.length)];
        let size =
          randomAction.size ||
          Math.floor(Math.random() * 2 * randomAction.minSize);
        accepted = game[randomAction.type](size);
      }
      callback();
    }, 1000 + Math.random() * 1000);
  };
  return {
    takeAction,
  };
};

module.exports = createBot;
