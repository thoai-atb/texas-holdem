const { findWinners, HandRank } = require("../texas_holdem/evaluator");
const { generateDeck, dealCards } = require("../texas_holdem/generator");
const { randomId } = require("../utils/random_id");
const createBot = require("./bot");
const robohashAvatars = require("robohash-avatars");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

const ROUND_TIME = 1500;
const SHOWDOWN_TIME = 6000;

function createGame(onUpdate, onInfo, onSoundEffect, onPlayerKicked) {
  const state = {
    id: randomId(), // TO IDENTIFY GAMES WHEN RESETTING
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
    winners: [],
    currentBetSize: 0,
    round: 0, // 0 = preflop, 1 = flop, 2 = turn, 3 = river
    availableActions: [
      /* type: "bet", maxSize: "1000" */
    ],
    bigblindIncrement: 10,
    bigblindSize: 10,
    minRaiseSize: 0,
    debugMode: false,
    winAmount: 0,
    botSpeed: 1000,
  };

  // COMMANDS

  const randomAvailableSeat = () => {
    const availableSeats = [];
    for (let i = 0; i < 9; i++) {
      if (!state.players[i]) availableSeats.push(i);
    }
    if (availableSeats.length === 0) return -1;
    return availableSeats[Math.floor(Math.random() * availableSeats.length)];
  };

  const addPlayer = (seatIndex, name) => {
    var avatarURL = robohashAvatars.generateAvatar({
      username: name,
      background: robohashAvatars.BackgroundSets.RandomBackground1,
      characters: robohashAvatars.CharacterSets.Kittens,
      height: 400,
      width: 400,
    });
    if (state.players[seatIndex]) return false;
    state.players[seatIndex] = {
      seatIndex,
      name,
      avatarURL,
      stack: 1000,
      cards: [],
    };
    if (!state.playing)
      state.players.forEach((player) => {
        if (player && !player.isBot) player.ready = false;
      });
    return true;
  };

  const addBot = (name) => {
    const seatIndex = state.players.findIndex((player) => !player);
    if (seatIndex === -1) return false;
    setBot(seatIndex, name);
    return true;
  };

  const setBot = (seatIndex, name) => {
    var avatarURL = robohashAvatars.generateAvatar({
      username: name,
      background: robohashAvatars.BackgroundSets.RandomBackground1,
      characters: robohashAvatars.CharacterSets.Robots,
      height: 400,
      width: 400,
    });
    state.players[seatIndex] = {
      seatIndex,
      name,
      bot: createBot(),
      isBot: true,
      avatarURL,
      stack: 1000,
      ready: true,
      cards: [],
    };
    if (!state.playing)
      state.players.forEach((player) => {
        if (player && !player.isBot) player.ready = false;
      });
  };

  const clearBots = () => {
    const ids = state.players.filter((player) => player && player.isBot);
    ids.forEach((id) => {
      removePlayer(id.seatIndex);
    });
  };

  const removePlayerByName = (name) => {
    const seatIndex = state.players.findIndex(
      (player) => player && player.name === name
    );
    if (seatIndex === -1) return false;
    removePlayer(seatIndex);
    return true;
  };

  const removePlayer = (seatIndex) => {
    if (state.turnIndex === seatIndex) {
      fold() || nextTurn();
    }
    if (!state.players[seatIndex].isBot) onPlayerKicked(seatIndex);
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

  const removeBrokeBots = () => {
    const ids = state.players.filter(
      (player) => player && player.isBot && player.stack < state.bigblindSize
    );
    ids.forEach((id) => {
      removePlayer(id.seatIndex);
    });
  };

  const removeBrokePlayers = () => {
    const ids = state.players.filter(
      (player) => player && player.stack < state.bigblindSize
    );
    ids.forEach((id) => {
      removePlayer(id.seatIndex);
    });
  };

  const fillMoney = (name) => {
    const seatIndex = state.players.findIndex(
      (player) => player && player.name === name
    );
    if (seatIndex === -1) return false;
    state.players[seatIndex].stack = Math.max(
      state.players[seatIndex].stack,
      1000
    );
    return true;
  };

  const setMoney = (name, amount) => {
    const seatIndex = state.players.findIndex(
      (player) => player && player.name === name
    );
    if (seatIndex === -1) return false;
    state.players[seatIndex].stack = amount;
    return true;
  };

  const setReady = (seatIndex) => {
    state.players[seatIndex].ready = true;
  };

  const setBlinds = (bigblindSize = 10, bigblindIncrement = 10) => {
    state.bigblindSize = bigblindSize;
    state.bigblindIncrement = bigblindIncrement;
  };

  // PLAYERS & COUNTINGS

  const checkToStart = () => {
    if (countQualifiedPlayers() <= 1) return;
    if (
      state.players.every(
        (player) =>
          !player || player?.ready || player.stack < state.bigblindSize
      ) &&
      !state.playing
    )
      startGame();
  };

  const countPlayers = () => {
    return state.players.filter((player) => player).length;
  };

  const countActivePlayers = () => {
    return state.players.filter(
      (player) => player?.cards?.length && !player.folded
    ).length;
  };

  const countQualifiedPlayers = () => {
    return state.players.filter(
      (player) => player && player.stack >= state.bigblindSize
    ).length;
  };

  // ACTIONS

  const deal = (seatIndex) => {
    state.players[seatIndex].cards = dealCards(state.deck, 2);
  };

  const fold = () => {
    if (!state.availableActions.find((action) => action.type === "fold"))
      return false;
    state.players[state.turnIndex].folded = true;
    if (state.completeActionSeat === state.turnIndex) {
      // OPEN ACTION FOLDED
      nextTurn(true);
      onSoundEffect("fold");
      return true;
    }
    nextTurn();
    onSoundEffect("fold");
    return true;
  };

  const check = () => {
    if (!state.availableActions.find((action) => action.type === "check"))
      return false;
    state.betTypes[state.turnIndex] = "check";
    nextTurn();
    onSoundEffect("check");
    return true;
  };

  const call = () => {
    const callAction = state.availableActions.find(
      (action) => action.type === "call"
    );
    if (!callAction) return false;
    const toCall = callAction.size;
    state.bets[state.turnIndex] += toCall;
    state.betTypes[state.turnIndex] = "call";
    state.players[state.turnIndex].stack -= toCall;
    nextTurn();
    onSoundEffect("call");
    return true;
  };

  const bet = (betSize) => {
    const betAction = state.availableActions.find(
      (action) => action.type === "bet"
    );
    if (!betAction) return false;
    if (!betSize) return false;
    if (betSize > betAction.maxSize) return false;
    if (betSize < betAction.minSize) return false;
    state.players[state.turnIndex].stack -= betSize;
    state.currentBetSize = betSize;
    state.bets[state.turnIndex] = betSize;
    state.minRaiseSize = betSize;
    state.betTypes[state.turnIndex] = "bet";
    state.completeActionSeat = state.turnIndex;
    nextTurn();
    onSoundEffect("bet");
    return true;
  };

  const raise = (raiseSize) => {
    const raiseAction = state.availableActions.find(
      (action) => action.type === "raise"
    );
    if (!raiseAction) return false;
    if (!raiseSize) return false;
    if (raiseSize > raiseAction.maxSize) return false;
    if (raiseSize < raiseAction.minSize) return false;
    const toCall = state.currentBetSize - state.bets[state.turnIndex];
    state.players[state.turnIndex].stack -= raiseSize + toCall;
    state.bets[state.turnIndex] += raiseSize + toCall;
    state.betTypes[state.turnIndex] = "raise";
    state.currentBetSize += raiseSize;
    state.minRaiseSize = raiseSize;
    state.completeActionSeat = state.turnIndex;
    nextTurn();
    onSoundEffect("raise");
    return true;
  };

  const blind = (position, size) => {
    if (state.players[position].stack < size) return false;
    const blindSize = size;
    state.players[position].stack -= blindSize;
    state.bets[position] = blindSize;
    state.betTypes[position] = "blind";
    state.currentBetSize = Math.max(state.currentBetSize, blindSize);
    state.minRaiseSize = size;
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

  const isQualified = (seatIndex) => {
    return (
      state.players[seatIndex] &&
      state.players[seatIndex].stack >= state.bigblindSize
    );
  };

  const nextQualifiedIndex = (index) => {
    if (
      state.players.every(
        (player) => !player || player.stack < state.bigblindSize
      )
    )
      return -1;
    do {
      index = (index + 1) % state.players.length;
    } while (
      index < 0 ||
      !state.players[index] ||
      state.players[index].stack < state.bigblindSize
    );
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
    if (countActivePlayers() == 1) {
      state.turnIndex = -1;
      setTimeout(() => nextRound(), ROUND_TIME);
      return;
    }
    const nextIndex = nextActiveIndex(state.turnIndex);
    if (carryCompleteActionSeat) {
      state.completeActionSeat = nextIndex;
    } else if (nextIndex == state.completeActionSeat) {
      state.turnIndex = -1;
      setTimeout(() => nextRound(), ROUND_TIME);
      return;
    }
    state.turnIndex = nextIndex;
    prepareTurn();
  };

  const nextButton = () => {
    state.buttonIndex = nextQualifiedIndex(state.buttonIndex);
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
        onSoundEffect("flip");
        break;
      case 2:
        state.board = [...state.board, ...dealCards(state.deck, 1)];
        onSoundEffect("flip");
        break;
      case 3:
        state.board = [...state.board, ...dealCards(state.deck, 1)];
        onSoundEffect("flip");
        break;
      case 4:
        showDown();
        return;
      default:
        break;
    }
    onUpdate();
    prepareTurn();
  };

  const collectBets = () => {
    state.currentBetSize = 0;
    state.pot += state.bets.reduce((a, b) => a + b, 0);
    state.bets.fill(0);
    state.betTypes.fill(null);
    state.minRaiseSize = 0;
  };

  const prepareTurn = () => {
    // CALCULATE AVAILABLE ACTIONS
    availableActions = [];
    const lastBet = state.bets[state.turnIndex];
    const toCall = state.currentBetSize - lastBet;
    const stack = state.players[state.turnIndex].stack;
    if (toCall > 0 && stack > 0) {
      availableActions.push({
        type: "fold", // can fold if not calling
      });
      availableActions.push({
        type: "call",
        size: Math.min(toCall, stack), // effective stack call size
      });
    }
    if (toCall === 0 || stack === 0) {
      availableActions.push({
        type: "check",
      });
    }
    if (state.currentBetSize > 0 && stack + lastBet > state.currentBetSize) {
      availableActions.push({
        type: "raise",
        minSize: Math.min(
          state.minRaiseSize,
          stack + lastBet - state.currentBetSize // effective stack raise size
        ),
        maxSize: stack + lastBet - state.currentBetSize,
      });
    }
    if (state.currentBetSize === 0 && stack > 0) {
      availableActions.push({
        type: "bet",
        minSize: Math.min(state.bigblindSize, stack), // effective stack bet size
        maxSize: stack,
      });
    }
    state.availableActions = availableActions;
    onUpdate();

    // CHECK FOR BOT TURN
    if (!state.players[state.turnIndex]?.isBot) return;
    let bot = state.players[state.turnIndex].bot;
    bot.takeAction(game, onUpdate);
    onUpdate();
  };

  const showDown = () => {
    state.turnIndex = -1;
    state.showDown = true;
    state.winners = findWinners(state.players, state.board);
    const winAmount = Math.floor(state.pot / state.winners.length);
    state.winAmount = winAmount;

    for (let winner of state.winners) {
      const info = `${
        state.players[winner.index].name
      } won $${winAmount} with ${winner.type.toUpperCase()} ${winner.cards
        .map((c) => c.value + c.suit)
        .join(" ")}`;
      if (!onInfo) {
        console.log(onInfo);
      } else onInfo(info, info);
    }

    const type = (() => {
      if (!state.winners.length) return "0";
      const typeStr = state.winners[0].type;
      if (HandRank[typeStr] <= HandRank["three of a kind"]) return "0";
      if (HandRank[typeStr] <= HandRank["full house"]) return "a";
      return "b";
    })();

    onSoundEffect("showdown_" + type);
    onUpdate();
    setTimeout(() => postShowDown(), SHOWDOWN_TIME);
  };

  const postShowDown = () => {
    state.winners.forEach(
      (winner) => (state.players[winner.index].stack += state.winAmount)
    );
    state.pot = 0;
    state.playing = false;
    state.bigblindSize += state.bigblindIncrement;
    state.winners = [];
    state.board = [];
    state.players.forEach((player) => {
      if (player) {
        player.ready = player.isBot;
        player.cards = [];
        player.folded = false;
      }
    });
    removeBrokeBots();
    nextButton();
    checkToStart();
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
    state.winners = [];
    state.showDown = false;
    state.round = 0;
    if (state.buttonIndex < 0 || !isQualified(state.buttonIndex)) nextButton();
    let tempIndex = state.buttonIndex;
    if (state.players[tempIndex].stack >= state.bigblindSize)
      deal(tempIndex, 2);
    tempIndex = nextQualifiedIndex(tempIndex);
    while (tempIndex != state.buttonIndex) {
      if (state.players[tempIndex].stack >= state.bigblindSize)
        deal(tempIndex, 2);
      tempIndex = nextQualifiedIndex(tempIndex);
    }
    tempIndex = nextQualifiedIndex(tempIndex); // TO SMALL BLIND
    blind(tempIndex, state.bigblindSize / 2);
    tempIndex = nextQualifiedIndex(tempIndex); // TO BIG BLIND
    blind(tempIndex, state.bigblindSize);
    tempIndex = nextQualifiedIndex(tempIndex); // TO UTG
    state.turnIndex = tempIndex;
    state.completeActionSeat = tempIndex;
    onSoundEffect("flip");
    prepareTurn();
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
    clearBots,
    removePlayerByName,
    removePlayer,
    removeBrokeBots,
    removeBrokePlayers,
    fillMoney,
    setMoney,
    nextTurn,
    nextButton,
    randomAvailableSeat,
    setBlinds,
  };

  return game;
}

module.exports = createGame;
