import { evaluate } from "./evaluator";

export function findWinner(players, board) {
  const results = players.map((player, position) => ({
    ...evaluate(player.cards, board),
    position: position,
  }));
  const sorted = results.sort((a, b) => b.strength - a.strength);
  return sorted[0];
}
