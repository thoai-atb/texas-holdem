const { evaluate } = require("../texas_holdem/evaluator");
const { CardSuit, CardValue } = require("../texas_holdem/enum");

const createBot = () => {
  const takeAction = (game, callback) => {
    const availableActions = game.state.availableActions;
    const foldAction = availableActions.filter(
      (action) => action.type === "fold"
    )[0];
    const passiveAction = availableActions.filter(
      (action) => action.type === "check" || action.type === "call"
    )[0];
    const aggressiveAction = availableActions.filter(
      (action) => action.type === "bet" || action.type === "raise"
    )[0];

    // CHECK IF ONLY ONE OPTION IS CHECK (ALREADY ALL IN)
    if (!foldAction && !aggressiveAction) {
      if (passiveAction) game[passiveAction.type]();
      callback();
      return;
    }

    const id = game.state.id;
    setTimeout(() => {
      if (game.state.id !== id) return;
      // if (!game.state.players[game.state.turnIndex]) return;
      relativeThinking(game, foldAction, passiveAction, aggressiveAction);
      callback();
    }, game.settings.botSpeed + Math.random() * game.settings.botSpeed);
  };

  const relativeThinking = (
    game,
    foldAction,
    passiveAction,
    aggressiveAction
  ) => {
    const thinkingOutLoud = game.settings.debugMode; // CONSOLE LOG THOUGHT FOR DEBUGGING
    const think = (thought) => {
      thinkingOutLoud && console.log(thought);
    };
    const handStrength = evaluate(
      game.state.players[game.state.turnIndex].cards,
      game.state.board
    ).strength;
    const contains = (cards, card) => {
      return cards.some((c) => c.suit === card.suit && c.value === card.value);
    };
    const getRandomCard = () => {
      const suit =
        Object.values(CardSuit)[
          Math.floor(Math.random() * Object.values(CardSuit).length)
        ];
      const value =
        Object.values(CardValue)[
          Math.floor(Math.random() * Object.values(CardValue).length)
        ];
      return {
        suit,
        value,
      };
    };
    const getRandomHand = () => {
      let visibleCards = [
        ...game.state.players[game.state.turnIndex].cards,
        ...game.state.board,
      ];
      let card1, card2;
      do {
        card1 = getRandomCard();
      } while (contains(visibleCards, card1));
      visibleCards.push(card1);
      do {
        card2 = getRandomCard();
      } while (contains(visibleCards, card2));
      return [card1, card2];
    };
    const randomStrength = () => {
      return evaluate(getRandomHand(), game.state.board).strength;
    };
    const winChance = (total) => {
      let wins = 0;
      let losses = 0;
      let ties = 0;
      for (let i = 0; i < total; i++) {
        const oppo = randomStrength();
        if (handStrength > oppo) wins++;
        else if (handStrength < oppo) losses++;
        else ties++;
      }
      return {
        wins,
        losses,
        ties,
        total,
      };
    };
    const bound = (size, action) => {
      if (size < action.minSize) return action.minSize;
      if (size > action.maxSize) return action.maxSize;
      return size;
    };

    const { wins, losses, ties, total } = winChance(30);
    const name = game.state.players[game.state.turnIndex].name;
    think(`${name} has ${wins} wins, ${losses} losses, and ${ties} ties`);
    think(
      `${name} sees that pot size is ${game.state.pot} and current bet is ${game.state.currentBetSize}`
    );
    let goodAggressiveSize;
    if (!aggressiveAction) goodAggressiveSize = 0;
    else if (aggressiveAction.type === "bet")
      goodAggressiveSize = 2 * game.state.pot;
    else if (aggressiveAction.type === "raise")
      goodAggressiveSize =
        ((game.state.pot || 0) + game.state.currentBetSize) * 2;
    think(`${name} has a good aggressive size of ${goodAggressiveSize}`);

    if (wins <= game.state.round + 1) {
      // BLUFF
      think(`${name} chooses to bluff`);
      if (aggressiveAction) {
        const size = Math.round((Math.random() - 0.5) * goodAggressiveSize);
        game[aggressiveAction.type](bound(size, aggressiveAction));
      } else if (foldAction) {
        game[foldAction.type]();
      } else game[passiveAction.type]();
      return;
    }

    if (wins <= 15) {
      // FOLD
      think(`${name} chooses to check/fold`);
      if (foldAction) {
        game[foldAction.type]();
      } else if (passiveAction) {
        game[passiveAction.type]();
      }
      return;
    }

    if (wins <= 27 - game.state.round) {
      // CHECK / CALL
      think(`${name} chooses to check/call`);
      if (passiveAction) {
        game[passiveAction.type]();
      }
      return;
    }

    { // BET / RAISE
      if (aggressiveAction) {
        const size = Math.round(Math.random() * goodAggressiveSize * 2);
        think(`${name} chooses to take aggressive action of ${size}`);
        game[aggressiveAction.type](bound(size, aggressiveAction));
      } else if (passiveAction) game[passiveAction.type]();
      else game[foldAction.type]();
      return;
    }
  };

  // Think completely randomly - deprecated (bots are smarter than this now)
  const diceThinking = (game, foldAction, passiveAction, aggressiveAction) => {
    const poolOfActions = [
      foldAction,
      passiveAction,
      passiveAction,
      passiveAction,
      passiveAction,
      aggressiveAction,
    ].filter((action) => action);
    let accepted = false;
    while (!accepted) {
      const randomAction =
        poolOfActions[Math.floor(Math.random() * poolOfActions.length)];
      let size =
        randomAction.size ||
        Math.floor(Math.random() * 2 * randomAction.minSize);
      accepted = game[randomAction.type](size);
    }
  };

  return {
    takeAction,
  };
};

module.exports = createBot;
