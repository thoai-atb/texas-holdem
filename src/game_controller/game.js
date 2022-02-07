const { findWinner } = require("../texas_holdem/evaluator");
const { generateDeck, dealCards } = require("../texas_holdem/generator");
const createBot = require("./bot");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

const ROUND_TIME = 1500;
const SHOWDOWN_TIME = 5000;

function createGame(onUpdate) {
  const state = {
    id:
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15), // TO IDENTIFY GAMES WHEN RESETTING
    players: new Array(9).fill(null),
    bets: new Array(9).fill(0),
    betTypes: new Array(9).fill(null),
    deck: [],
    board: [],
    pot: 0,
    playing: false,
    turnIndex: -1,
    buttonIndex: -1,
    completeActionSeat: -1,
    winner: null,
    currentBetSize: 0,
    round: 0, // 0 = preflop, 1 = flop, 2 = turn, 3 = river
  };

  // PLAYERS

  const addPlayer = (seatIndex, name) => {
    state.players[seatIndex] = {
      seatIndex,
      name,
      stack: 1000,
      cards: [],
    };
    if (!state.playing)
      state.players.forEach((player) => {
        if (player && !player.isBot) player.ready = false;
      });
  };

  const addBot = (name) => {
    const seatIndex = state.players.findIndex((player) => !player);
    if (seatIndex === -1) return false;
    setBot(seatIndex, name);
    return true;
  };

  const setBot = (seatIndex, name) => {
    state.players[seatIndex] = {
      seatIndex,
      name,
      bot: createBot(),
      isBot: true,
      stack: 1000,
      ready: true,
      cards: [],
    };
    if (!state.playing)
      state.players.forEach((player) => {
        if (player && !player.isBot) player.ready = false;
      });
  };

  const removePlayer = (seatIndex) => {
    if (state.turnIndex === seatIndex) {
      fold();
    }
    state.players[seatIndex] = null;
    if (!state.playing)
      state.players.forEach((player) => {
        if (player && !player.isBot) player.ready = false;
      });
    else {
      if (countPlayers() == 1) {
        collectBets();
        showDown();
      }
    }
  };

  const setReady = (seatIndex) => {
    state.players[seatIndex].ready = true;
  };

  const checkToStart = () => {
    if (countPlayers() <= 1) return;
    if (state.players.every((player) => player?.ready || !player)) startGame();
  };

  const countPlayers = () => {
    return state.players.filter((player) => player).length;
  };

  const countActivePlayers = () => {
    return state.players.filter(
      (player) => player?.cards?.length && !player.folded
    ).length;
  };

  // ACTIONS

  const deal = (seatIndex) => {
    state.players[seatIndex].cards = dealCards(state.deck, 2);
  };

  const fold = () => {
    state.players[state.turnIndex].folded = true;
    if (state.completeActionSeat === state.turnIndex) {
      nextTurn(true);
      return true;
    }
    nextTurn();
    return true;
  };

  const check = () => {
    if (state.players[state.turnIndex].stack > 0)
      if (state.currentBetSize > state.bets[state.turnIndex]) return false;
    state.betTypes[state.turnIndex] = "check";
    nextTurn();
    return true;
  };

  const call = () => {
    var toCall = state.currentBetSize - state.bets[state.turnIndex];
    if (toCall > state.players[state.turnIndex].stack) {
      if (state.players[state.turnIndex].stack === 0) {
        return false;
      }
      toCall = state.players[state.turnIndex].stack;
    }
    state.bets[state.turnIndex] += toCall;
    state.betTypes[state.turnIndex] = "call";
    state.players[state.turnIndex].stack -= toCall;
    nextTurn();
    return true;
  };

  const bet = () => {
    if (state.currentBetSize > 0) return false;
    if (state.players[state.turnIndex].stack === 0) return false;
    const betSize = Math.ceil(
      Math.random() * 50,
      state.players[state.turnIndex].stack
    );
    state.players[state.turnIndex].stack -= betSize;
    state.currentBetSize = betSize;
    state.bets[state.turnIndex] = betSize;
    state.betTypes[state.turnIndex] = "bet";
    state.completeActionSeat = state.turnIndex;
    nextTurn();
    return true;
  };

  const raise = () => {
    if (state.currentBetSize === 0) return false;
    const toCall = state.currentBetSize - state.bets[state.turnIndex];
    if (toCall > state.players[state.turnIndex].stack) {
      return false;
    }
    const raiseSize = Math.ceil(Math.random() * 100, state.players[state.turnIndex].stack - toCall);
    state.players[state.turnIndex].stack -= raiseSize + toCall;
    state.bets[state.turnIndex] += raiseSize + toCall;
    state.betTypes[state.turnIndex] = "raise";
    state.currentBetSize += raiseSize;
    state.completeActionSeat = state.turnIndex;
    nextTurn();
    return true;
  };

  const blind = (position, size) => {
    const blindSize = Math.min(size, state.players[position].stack);
    state.players[position].stack -= blindSize;
    state.bets[position] = blindSize;
    state.betTypes[position] = "blind";
    state.currentBetSize = Math.max(state.currentBetSize, blindSize);
    return true;
  };

  // TURNS

  const nextIndex = (index) => {
    if (state.players.every((player) => !player)) return -1;
    do {
      index = (index + 1) % state.players.length;
    } while (index < 0 || !state.players[index]);
    return index;
  };

  const nextActiveIndex = (index) => {
    if (
      state.players.every((player) => !player?.cards?.length || player.folded)
    )
      return -1;
    do {
      index = (index + 1) % state.players.length;
    } while (
      index < 0 ||
      !state.players[index]?.cards?.length ||
      state.players[index].folded
    );
    return index;
  };

  const nextTurn = (carryCompleteActionSeat) => {
    const nextIndex = nextActiveIndex(state.turnIndex);
    if (carryCompleteActionSeat) {
      state.completeActionSeat = nextIndex;
    } else if (nextIndex == state.completeActionSeat) {
      state.turnIndex = -1;
      setTimeout(() => nextRound(), ROUND_TIME);
      return;
    }
    state.turnIndex = nextIndex;
    checkBotTurn();
  };

  const nextButton = () => {
    state.buttonIndex = nextIndex(state.buttonIndex);
  };

  const nextRound = () => {
    state.round += 1;
    state.turnIndex = nextActiveIndex(state.buttonIndex);
    collectBets();
    state.completeActionSeat = state.turnIndex;
    if (countActivePlayers() == 1) {
      showDown();
      return;
    }
    switch (state.round) {
      case 1:
        state.board = dealCards(state.deck, 3);
        break;
      case 2:
        state.board = [...state.board, ...dealCards(state.deck, 1)];
        break;
      case 3:
        state.board = [...state.board, ...dealCards(state.deck, 1)];
        break;
      case 4:
        showDown();
        return;
      default:
        break;
    }
    onUpdate();
    checkBotTurn();
  };

  const collectBets = () => {
    state.currentBetSize = 0;
    state.pot += state.bets.reduce((a, b) => a + b, 0);
    state.bets.fill(0);
    state.betTypes.fill(null);
  };

  const checkBotTurn = () => {
    if (!state.players[state.turnIndex]?.isBot) return;
    let bot = state.players[state.turnIndex].bot;
    bot.takeAction(game, onUpdate);
  };

  const showDown = () => {
    state.turnIndex = -1;
    state.showDown = true;
    state.winner = findWinner(state.players, state.board);
    onUpdate();
    setTimeout(() => postShowDown(), SHOWDOWN_TIME);
  };

  const postShowDown = () => {
    if (state.winner?.index && state.players[state.winner.index])
      state.players[state.winner.index].stack += state.pot;
    state.pot = 0;
    state.playing = false;
    state.winner = null;
    state.board = [];
    state.players.forEach((player) => {
      if (player) {
        player.ready = player.isBot;
        player.cards = [];
        player.folded = false;
      }
    });
    onUpdate();
  };

  const startGame = () => {
    if (state.playing) {
      console.log("Game already started");
      return;
    }
    if (state.players.every((player) => player === null)) {
      console.log("No players to start game");
      return;
    }
    state.playing = true;
    state.deck = generateDeck();
    state.board = [];
    state.players.forEach((player) => {
      if (player) {
        player.folded = false;
      }
    });
    state.winner = null;
    state.showDown = false;
    state.round = 0;
    nextButton();
    let tempIndex = state.buttonIndex;
    deal(tempIndex, 2);
    tempIndex = nextIndex(tempIndex);
    while (tempIndex != state.buttonIndex) {
      deal(tempIndex, 2);
      tempIndex = nextIndex(tempIndex);
    }
    tempIndex = nextIndex(tempIndex); // TO SMALL BLIND
    blind(tempIndex, 5);
    tempIndex = nextIndex(tempIndex); // TO BIG BLIND
    blind(tempIndex, 10);
    tempIndex = nextIndex(tempIndex); // TO UTG
    state.turnIndex = tempIndex;
    state.completeActionSeat = tempIndex;
    checkBotTurn();
  };

  const game = {
    state,
    startGame,
    setReady,
    checkToStart,
    deal,
    fold,
    check,
    bet,
    call,
    raise,
    addPlayer,
    setBot,
    addBot,
    removePlayer,
    nextTurn,
    nextButton,
  };

  return game;
}

module.exports = createGame;
