const createBot = () => {
  const takeAction = (game, callback) => {
    const availableActions = getAvailableActions(game.state);
    const randomAction =
      availableActions[Math.floor(Math.random() * availableActions.length)];
    setTimeout(() => {
      game[randomAction]();
      callback();
    }, 1000);
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
