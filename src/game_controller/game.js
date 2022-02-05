const { generateDeck, dealCards } = require("../texas_holdem/generator");
// const { evaluate, findWinner } = require("../texas_holdem/evaluator");

function game() {
  const deck = generateDeck();
  const players = [];
  for (let i = 0; i < 9; i++) {
    players.push({
      name: "Player " + (i + 1),
      stack: 1000,
      cards: dealCards(deck, 2),
    });
  }
  const board = dealCards(deck, 5);
  return {
    players,
    board,
    deck,
  }
}

module.exports = game;