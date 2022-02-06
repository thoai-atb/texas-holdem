const { findWinner } = require("../texas_holdem/evaluator");
const { generateDeck, dealCards } = require("../texas_holdem/generator");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

function createGame() {
  const state = {
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

  const addPlayer = (seatIndex) => {
    state.players[seatIndex] = {
      seatIndex,
      stack: 1000,
      cards: [],
    };
    if (!state.playing)
      state.players.forEach((player) => {
        if (player) player.ready = false;
      });
  };

  const removePlayer = (seatIndex) => {
    if (state.turnIndex === seatIndex) {
      fold();
    }
    state.players[seatIndex] = null;
    if (!state.playing)
      state.players.forEach((player) => {
        if (player) player.ready = false;
      });
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
      state.completeActionSeat = nextActiveIndex(state.completeActionSeat);
    }
    nextTurn();
  };

  const check = () => {
    if (state.currentBetSize === 0) nextTurn();
  };

  const call = () => {
    const toCall = state.currentBetSize - state.bets[state.turnIndex];
    state.bets[state.turnIndex] += toCall;
    state.betTypes[state.turnIndex] = "call";
    state.players[state.turnIndex].stack -= toCall;
    nextTurn();
  };

  const bet = () => {
    if (state.currentBetSize > 0) return;
    const betSize = 10;
    state.players[state.turnIndex].stack -= betSize;
    state.currentBetSize = betSize;
    state.bets[state.turnIndex] = betSize;
    state.betTypes[state.turnIndex] = "bet";
    state.completeActionSeat = state.turnIndex;
    nextTurn();
  };

  const raise = () => {
    if (state.currentBetSize === 0) return;
    const toCall = state.currentBetSize - state.bets[state.turnIndex];
    const raiseSize = 10;
    state.players[state.turnIndex].stack -= raiseSize + toCall;
    state.bets[state.turnIndex] += raiseSize + toCall;
    state.betTypes[state.turnIndex] = "raise";
    state.currentBetSize += raiseSize;
    state.completeActionSeat = state.turnIndex;
    nextTurn();
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

  const previousActiveIndex = (index) => {
    if (
      state.players.every((player) => !player?.cards?.length || player.folded)
    )
      return -1;
    do {
      index = (index - 1 + state.players.length) % state.players.length;
    } while (
      index < 0 ||
      !state.players[index]?.cards?.length ||
      state.players[index].folded
    );
    return index;
  };

  const nextTurn = () => {
    state.turnIndex = nextActiveIndex(state.turnIndex);
    if (state.turnIndex == state.completeActionSeat) nextRound();
  };

  const nextButton = () => {
    state.buttonIndex = nextIndex(state.buttonIndex);
  };

  const nextRound = () => {
    state.round += 1;
    state.turnIndex = nextActiveIndex(state.buttonIndex);
    state.currentBetSize = 0;
    state.pot += state.bets.reduce((a, b) => a + b, 0);
    state.bets.fill(0);
    state.betTypes.fill(null);
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
        break;
      default:
        break;
    }
  };

  const showDown = () => {
    state.winner = findWinner(state.players, state.board);
    state.players[state.winner.index].stack += state.pot;
    state.pot = 0;
    state.playing = false;
    state.players.forEach((player) => {
      if (player) {
        player.ready = false;
        player.folded = false;
      }
    });
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
    state.winner = null;
    state.round = 0;
    nextButton();
    let tempIndex = state.buttonIndex;
    deal(tempIndex, 2);
    tempIndex = nextIndex(tempIndex);
    while (tempIndex != state.buttonIndex) {
      deal(tempIndex, 2);
      tempIndex = nextIndex(tempIndex);
    }
    tempIndex = nextIndex(tempIndex);
    tempIndex = nextIndex(tempIndex);
    tempIndex = nextIndex(tempIndex);
    state.turnIndex = tempIndex;
    state.completeActionSeat = tempIndex;
  };

  return {
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
    removePlayer,
    nextTurn,
    nextButton,
  };
}

module.exports = createGame;
