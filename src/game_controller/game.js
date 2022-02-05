const { generateDeck, dealCards } = require("../texas_holdem/generator");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

function createGame() {
  const state = {
    players: new Array(9).fill(null),
    deck : [],
    board: [],
    playing: false,
    turnIndex: -1,
    buttonIndex: -1,
  };

  const addPlayer = (seatIndex) => {
    state.players[seatIndex] = {
      stack: 1000,
      cards: [],
    };
  };

  const removePlayer = (seatIndex) => {
    state.players[seatIndex] = null;
  };

  const deal = (seatIndex) => {
    state.players[seatIndex].cards = dealCards(state.deck, 2);
  };

  const nextIndex = (index) => {
    if (state.players.every((player) => player === null)) return index;
    do {
      index = (index + 1) % state.players.length;
    } while (index < 0 || state.players[index] === null);
    return index;
  };

  const nextTurn = () => {
    state.turnIndex = nextIndex(state.turnIndex);
  };

  const nextButton = () => {
    state.buttonIndex = nextIndex(state.buttonIndex);
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
    nextButton();
    state.turnIndex = state.buttonIndex;
    deal(state.turnIndex, 2);
    nextTurn();
    while (state.turnIndex != state.buttonIndex) {
      deal(state.turnIndex, 2);
      nextTurn();
    }
    nextTurn();
  };

  return {
    state,
    startGame,
    deal,
    addPlayer,
    removePlayer,
    nextTurn,
    nextButton,
  };
}

module.exports = createGame;
