const createBot = () => {
  const takeAction = (game, callback) => {
    const availableActions = getAvailableActions(game.state);
    const foldAction = availableActions.filter((action) => action === "fold");
    const passiveAction = availableActions.filter(
      (action) => action === "check" || action === "call"
    );
    const agressiveAction = availableActions.filter(
      (action) => action === "bet" || action === "raise"
    );
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
      if (game.state.id !== id) {
        return;
      }
      let accepted = false;
      while (!accepted) {
        const randomAction =
          poolOfActions[Math.floor(Math.random() * poolOfActions.length)];
        accepted = game[randomAction]();
      }
      callback();
    }, 1000 + Math.random() * 1000);
  };
  return {
    takeAction,
  };
};

const getAvailableActions = (state) => {
  const availableActions = [];
  if (state.currentBetSize > 0) {
    availableActions.push("raise");
    availableActions.push("call");
    availableActions.push("fold");
  }
  if (state.currentBetSize === 0) {
    availableActions.push("bet");
    availableActions.push("check");
  }
  return availableActions;
};

module.exports = createBot;
