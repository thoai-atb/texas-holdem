import { CardSuit, CardValue } from "./card";
import { Evaluator } from "./evaluator";

const { evaluate, HandRank } = Evaluator;

export function calculateStatistics(board, playerHand) {
  // CASE 1
  if (board.length === 5) {
    let statistics = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const result = evaluate(playerHand, board);
    const index = 9 - HandRank[result.type];
    statistics[index] = 1;
    return statistics;
  }
  // Preparation for CASE 2, 3
  var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // sf, 4, fh, f, s, 3, 2-p, 1-p, high
  var deck = [];
  for (const suit of Object.values(CardSuit)) {
    for (const value of Object.values(CardValue)) {
      const card = { suit, value };
      if (testInclude([...board, ...playerHand], card)) continue;
      deck.push(card);
    }
  }
  // CASE 2
  if (board.length === 4) {
    for (const card of deck) {
      const result = evaluate(playerHand, [...board, card]);
      const index = 9 - HandRank[result.type];
      counts[index]++;
    }
  }
  // CASE 3 (still use if condition for clarity)
  if (board.length === 3) {
    for (let i = 0; i < deck.length - 1; i++)
      for (let j = i + 1; j < deck.length; j++) {
        const c1 = deck[i], c2 = deck[j];
        const result = evaluate(playerHand, [...board, c1, c2]);
        const index = 9 - HandRank[result.type];
        counts[index]++;
      }
  }
  // Compute statistics for CASE 2, 3
  const sum = counts.reduce((p, c) => p + c, 0)
  const statistics = counts.map(c => c/sum);
  return statistics;
}

function testInclude(cards, card) {
  for (const c of cards) {
    if (c.suit === card.suit && c.value === card.value) return true;
  }
  return false;
}
