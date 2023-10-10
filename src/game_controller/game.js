const { findWinners, HandRank } = require("../texas_holdem/evaluator");
const { generateDeck, dealCards } = require("../texas_holdem/generator");
const { randomId } = require("../utils/random_id");
const { generateBotName, getRandomPhrase } = require("./utils");
const createBot = require("./bot");
const robohashAvatars = require("robohash-avatars");
const {
  BOT_BET_CHAT,
  BOT_CHECK_CHAT,
  BOT_FOLD_CHAT,
  BOT_GREETING_CHAT,
  BOT_RAISE_CHAT,
  BOT_WIN_CHAT,
} = require("./config");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

const ROUND_TIME = 1500;
const SHOWDOWN_TIME = 6000;
const WIN_CHAT_DELAY = SHOWDOWN_TIME + 1000;
const RIVER_ROUND = 3;

function createGame(
  onUpdate,
  onInfo,
  onSoundEffect,
  onPlayerKicked,
  onChat,
  onNewRound,
  gameConfig
) {
  /*****************************************************************************
  |  This game state will be passed on to client every single refreshes,       |
  |  it contains all states about the game (current player, bets, cards, etc.) |
  *****************************************************************************/
  const state = {
    id: randomId(), // to identify different games when resetting
    players: new Array(9).fill(null),
    bets: new Array(9).fill(0), // amount of bets for each seat
    betTypes: new Array(9).fill(null), // "check" | "call" | "raise"
    playersRanking: new Array(9).fill(0), // players ranking are updated after each round
    deck: [],
    board: [],
    pot: 0,
    playing: false,
    turnIndex: -1,
    buttonIndex: -1, // dealer button index
    completeActionSeat: -1, // if the next index is this, go to next round
    winners: [], // can have multiple winners if hand ranks are equal
    currentBetSize: 0,
    round: 0, // 0 = preflop, 1 = flop, 2 = turn, 3 = river
    availableActions: [
      /* action data type: {
          type: "fold" | "call" | "bet" | "raise"
          size: <fixed size for call> - to call
            (for call, size does not include player's bet already on the table)
          minSize: <min size for bet/raise> 
            (for raise, minSize does not include player's bet already on the table)
          maxSize: <max size for bet/raise>
            (for raise, maxSize does not include player's bet already on the table)
      } */
    ],
    bigblindIncrement: 10,
    bigblindSize: 10,
    minRaiseSize: 0,
    debugMode: gameConfig.DEBUG_MODE, // client also uses this for debugging
    winAmount: 0,
    showDown: false, // is the game announcing the winner?
    allPlayersAllIn: false, // is all players alled in? - no more actions from here?
    botSpeed: 1000, // how long should bots think?
    limitGame: gameConfig.LIMIT_GAME, // boolean - leave false for no limit
    limitBetMultiplier: gameConfig.LIMIT_BET_MULTIPLIER, // if limit bet size is true, this limit multiplier is used
    endRoundAutoFillBots: gameConfig.END_ROUND_AUTO_FILL_BOTS,
    botsDefeated: 0,
    gamesPlayed: 0,
    lastChatTimeStamp: 0,
  };

  const playersLeftTheTable = {
    /*
      "John": { stack: 200, timesWorked: 1, timesWon: 1000, botsDefeated: 2 }
    */
  };

  /* =======================================
  |         ADD & REMOVE PLAYERS           |
  ======================================= */

  const randomAvailableSeat = () => {
    const availableSeats = [];
    for (let i = 0; i < 9; i++) {
      if (!state.players[i]) availableSeats.push(i);
    }
    if (availableSeats.length === 0) return -1;
    return availableSeats[Math.floor(Math.random() * availableSeats.length)];
  };

  const nameExisted = (name) => {
    for (const player of state.players) {
      if (player && player.name === name) return true;
    }
    return false;
  };

  const checkIsBot = (name) => {
    for (const player of state.players) {
      if (player && player.isBot && player.name === name) return true;
    }
    return false;
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
    var saved = playersLeftTheTable;
    var stack = name in saved ? saved[name].stack : 1000;
    var timesWorked = name in saved ? saved[name].timesWorked : 0;
    var timesWon = name in saved ? saved[name].timesWon : 0;
    var botsDefeated = name in saved ? saved[name].botsDefeated : 0;
    state.players[seatIndex] = {
      seatIndex,
      name,
      avatarURL,
      stack: stack,
      cards: [],
      working: false,
      timesWorked: timesWorked,
      timesWon: timesWon,
      botsDefeated: botsDefeated,
    };
    state.playersRanking[seatIndex] = 0;
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
    ifBotThenConsiderChat(seatIndex, ...BOT_GREETING_CHAT);
    return true;
  };

  const fillBots = () => {
    for (let i = 0; i < 9; i++) {
      if (state.players[i] === null) addBot(generateBotName());
    }
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
      working: false,
      timesWon: 0,
      botsDefeated: 0,
    };
    state.playersRanking[seatIndex] = 0;
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
    if (state.players[seatIndex].isBot) removePlayer(seatIndex);
    else onPlayerKicked(seatIndex);
    return true;
  };

  const removePlayer = (seatIndex) => {
    if (state.turnIndex === seatIndex) {
      fold() || nextTurn();
    }
    if (!state.players[seatIndex]) return;
    var player = state.players[seatIndex];
    playersLeftTheTable[player.name] = {
      stack: player.stack,
      timesWorked: player.timesWorked,
      timesWon: player.timesWon,
      botsDefeated: player.botsDefeated,
    };
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
      onInfo(`${id.name} was defeated and left the table`);
      removePlayer(id.seatIndex);
    });
    return ids.length; // number of bots defeated in round
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

  const addMoney = (name, amount) => {
    const seatIndex = state.players.findIndex(
      (player) => player && player.name === name
    );
    if (seatIndex === -1) return false;
    state.players[seatIndex].stack += amount;
    return true;
  };

  const earnTimesWorked = (seatIndex) => {
    state.players[seatIndex].timesWorked += 1;
    return state.players[seatIndex].timesWorked;
  };

  const setWorking = (seatIndex, working) => {
    state.players[seatIndex].working = working;
  };

  const setReady = (seatIndex) => {
    state.players[seatIndex].ready = true;
  };

  const setBlinds = (bigblindSize = 10, bigblindIncrement = 10) => {
    state.bigblindSize = bigblindSize;
    state.bigblindIncrement = bigblindIncrement;
  };

  /* =======================================
  |           PLAYERS FUNCTIONS            |
  ======================================= */

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

  const isAllPlayersAlledIn = () => {
    return (
      state.players.filter(
        (player) => player?.cards?.length && !player.folded && player.stack != 0
      ).length <= 1
    );
  };

  /* =======================================
  |             PLAYER ACTIONS             |
  ======================================= */

  const fold = () => {
    if (!state.availableActions.find((action) => action.type === "fold"))
      return false;
    state.players[state.turnIndex].folded = true;
    ifBotThenConsiderChat(state.turnIndex, ...BOT_FOLD_CHAT);
    onSoundEffect("fold");
    if (state.completeActionSeat === state.turnIndex) {
      // OPEN ACTION FOLDED
      nextTurn(true);
      return true;
    }
    nextTurn();
    return true;
  };

  const check = () => {
    if (!state.availableActions.find((action) => action.type === "check"))
      return false;
    state.betTypes[state.turnIndex] = "check";
    if (state.round !== RIVER_ROUND)
      ifBotThenConsiderChat(state.turnIndex, ...BOT_CHECK_CHAT);
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
    ifBotThenConsiderChat(state.turnIndex, ...BOT_BET_CHAT);
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
    ifBotThenConsiderChat(state.turnIndex, ...BOT_RAISE_CHAT);
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

  /* =======================================
  |            INDEX FUNCTIONS             |
  ======================================= */

  // Get next player who is in the table (regardless of money, folded or not)
  const nextIndex = (index) => {
    if (state.players.every((player) => !player)) return -1;
    do {
      index = (index + 1) % state.players.length;
    } while (index < 0 || !state.players[index]);
    return index;
  };

  // Is player at seat index has enough money for a new round?
  const isQualified = (seatIndex) => {
    return (
      state.players[seatIndex] &&
      state.players[seatIndex].stack >= state.bigblindSize
    );
  };

  // Get next seat who has enough money for a new round
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

  // Get next seat who is still in the game (not folded)
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

  const ifBotThenConsiderChat = (
    seatIndex,
    phraseType,
    probability = 1,
    delayTime = 1000,
    randomDuration = 0,
    onlyChatWhenSilenceFor = 10000
  ) => {
    if (Math.random() < probability)
      if (state.players[seatIndex]?.isBot)
        setTimeout(() => {
          if (!state.players[seatIndex]) return;
          if (Date.now() - state.lastChatTimeStamp < onlyChatWhenSilenceFor)
            return;
          onChat(
            state.players[seatIndex].name,
            getRandomPhrase(phraseType),
            seatIndex
          );
          state.lastChatTimeStamp = Date.now();
        }, Math.random() * randomDuration + delayTime);
  };

  /* =======================================
  |           TURNS & UPDATES              |
  ======================================= */

  const nextTurn = (carryCompleteActionSeat) => {
    if (countActivePlayers() == 1) {
      state.turnIndex = -1;
      setTimeout(() => nextRound(), ROUND_TIME);
      return;
    }
    const nextIndex = nextActiveIndex(state.turnIndex);
    if (carryCompleteActionSeat) {
      // If player fold, complete action seat will be carried over the next seat
      state.completeActionSeat = nextIndex;
    } else if (nextIndex == state.completeActionSeat) {
      // If reached the last player who made an action -> round finished
      state.turnIndex = -1;
      if (isAllPlayersAlledIn()) {
        state.allPlayersAllIn = true;
        onSoundEffect("flip");
      }
      setTimeout(() => nextRound(), ROUND_TIME);
      return;
    }
    state.turnIndex = nextIndex;
    prepareTurn();
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
    const lastBet = state.bets[state.turnIndex]; // player's bet already on the table
    const toCall = state.currentBetSize - lastBet;
    const stack = state.players[state.turnIndex].stack; // player's remaining chips
    const maxLimitMultiplier = state.limitBetMultiplier;

    // FOLD & CALL
    if (toCall > 0 && stack > 0) {
      availableActions.push({
        type: "fold", // can fold if not calling
      });
      availableActions.push({
        type: "call",
        size: Math.min(toCall, stack), // effective stack call size
      });
    }

    // CHECK
    if (toCall === 0 || stack === 0) {
      availableActions.push({
        type: "check",
      });
    }

    // RAISE
    if (
      !state.allPlayersAllIn &&
      state.currentBetSize > 0 &&
      stack + lastBet > state.currentBetSize
    ) {
      let maxSize = stack + lastBet - state.currentBetSize; // no-limit
      if (game.state.limitGame) {
        maxSize = Math.min(
          Math.max(
            maxLimitMultiplier * state.bigblindSize,
            maxLimitMultiplier * state.currentBetSize,
            maxLimitMultiplier * state.pot
          ) - state.currentBetSize,
          stack + lastBet - state.currentBetSize
        );
      }
      availableActions.push({
        type: "raise",
        minSize: Math.min(
          state.minRaiseSize,
          stack + lastBet - state.currentBetSize // effective stack raise size
        ),
        maxSize: maxSize,
      });
    }

    // BET
    if (!state.allPlayersAllIn && state.currentBetSize === 0 && stack > 0) {
      let maxSize = stack; // no-limit
      if (game.state.limitGame) {
        maxSize = Math.min(
          Math.max(
            maxLimitMultiplier * state.bigblindSize,
            maxLimitMultiplier * state.pot
          ),
          stack
        );
      }
      availableActions.push({
        type: "bet",
        minSize: Math.min(state.bigblindSize, stack), // effective stack bet size
        maxSize: maxSize,
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
      } else onInfo(info);
      console.log(info);
      ifBotThenConsiderChat(winner.index, ...BOT_WIN_CHAT);
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

  const nextButton = () => {
    state.buttonIndex = nextQualifiedIndex(state.buttonIndex);
  };

  const updateRankings = () => {
    const sorted = state.players
      .map((p) => {
        if (!p) return null;
        return p.stack;
      })
      .filter((v) => v)
      .sort((a, b) => b - a);
    for (let i = 0; i < state.players.length; i++) {
      const player = state.players[i];
      if (!player) continue;
      const currentPoint = player.stack;
      const idx = sorted.indexOf(currentPoint);
      const lastIdx = sorted.lastIndexOf(currentPoint);
      if (lastIdx > 2) state.playersRanking[i] = 0; // too many players
      else if (idx === 0 && lastIdx === sorted.length - 1)
        state.playersRanking[i] = 0; // don't show ranking if all player are 1st
      else state.playersRanking[i] = idx + 1;
    }
  };

  const postShowDown = () => {
    // Reset variables
    state.showDown = false;
    state.allPlayersAllIn = false;
    state.pot = 0;
    state.playing = false;
    state.bigblindSize += state.bigblindIncrement;
    state.board = [];
    state.gamesPlayed += 1;

    // Update winners and players
    const winnerIndexes = []; // to update stats
    state.winners.forEach((winner) => {
      state.players[winner.index].stack += state.winAmount;
      state.players[winner.index].timesWon += 1;
      winnerIndexes.push(winner.index);
    });
    state.winners = [];
    state.players.forEach((player) => {
      if (player) {
        player.ready = player.isBot;
        player.cards = [];
        player.folded = false;
      }
    });

    if (state.endRoundAutoFillBots) fillBots();
    var botsDefeated = removeBrokeBots();
    if (botsDefeated > 0) {
      state.botsDefeated += botsDefeated;
      for (let index of winnerIndexes) {
        state.players[index].botsDefeated +=
          botsDefeated / winnerIndexes.length;
      }
    }

    // Prepare for next round
    updateRankings();
    nextButton();
    checkToStart();
    onUpdate();
    onNewRound();
  };

  const deal = (seatIndex) => {
    state.players[seatIndex].cards = dealCards(state.deck, 2);
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
    nameExisted,
    checkIsBot,
    addPlayer,
    setBot,
    addBot,
    fillBots,
    clearBots,
    removePlayerByName,
    removePlayer,
    removeBrokeBots,
    removeBrokePlayers,
    fillMoney,
    setMoney,
    addMoney,
    earnTimesWorked,
    setWorking,
    nextTurn,
    nextButton,
    randomAvailableSeat,
    setBlinds,
  };

  return game;
}

module.exports = createGame;
