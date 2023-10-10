const BOT_GREETING_CHAT = [
  "greeting-phrases",
  1, // probability
  1000, // delay time
  4000, // random duration time
  1000, // only chat when silence for
];
const BOT_FOLD_CHAT = [
  "fold-phrases",
  0.1, // probability
  undefined, // delay time
  undefined, // random duration time
  10000, // only chat when silence for
];
const BOT_WIN_CHAT = [
  "win-phrases",
  0.6,
  7000, // delay time
  0, // random duration time
  0, // only chat when silence for
];
const BOT_CHECK_CHAT = [
  "random-phrases",
  0.2, // probability
  undefined, // delay time
  undefined, // random duration time
  10000, // only chat when silence for
];
const BOT_BET_CHAT = [
  "bet-phrases",
  0.2, // probability
  undefined, // delay time
  undefined, // random duration time
  10000, // only chat when silence for
];
const BOT_RAISE_CHAT = [
  "raise-phrases",
  0.2, // probability
  undefined, // delay time
  undefined, // random duration time
  10000, // only chat when silence for
];

module.exports = {
  BOT_BET_CHAT,
  BOT_CHECK_CHAT,
  BOT_FOLD_CHAT,
  BOT_GREETING_CHAT,
  BOT_RAISE_CHAT,
  BOT_WIN_CHAT,
};
