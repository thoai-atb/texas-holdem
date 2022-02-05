import React, { useEffect } from "react";
import { findWinner } from "../utilities/comparator";
import { generateDeck, dealCards } from "../utilities/dealer";
import { evaluate } from "../utilities/evaluator";

const GameContext = React.createContext({});

export function GameProvider({ children }) {
  const [deck, setDeck] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [board, setBoard] = React.useState([]);
  const [inspection, setInspection] = React.useState();

  useEffect(() => {
    const newDeck = generateDeck();
    let newPlayers = [];
    for (let i = 0; i < 9; i++) {
      newPlayers.push({
        name: "Player " + (i + 1),
        cards: dealCards(newDeck, 2),
      });
    }
    let newBoard = dealCards(newDeck, 5);
    let winner = findWinner(newPlayers, newBoard);
    setInspection(winner);
    setDeck(newDeck);
    setBoard(newBoard);
    setPlayers(newPlayers);
  }, []);

  const inspect = (position) => {
    const newInspection = evaluate(players[position].cards, board);
    newInspection.position = position;
    setInspection(newInspection);
  };

  const value = { deck, board, players, inspect, inspection };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
