import React, { useEffect } from "react";
import { generateDeck, dealCards } from "../utilities/dealer";
import { evaluate } from "../utilities/evaluator";

const GameContext = React.createContext({});

export function GameProvider({ children }) {
  const [deck, setDeck] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [board, setBoard] = React.useState([]);
  const [inspection, setInspection] = React.useState();
  const [pot, setPot] = React.useState(0);

  useEffect(() => {
    // eslint-disable-next-line no-unused-vars
    let newDeck, newPlayers, newBoard, winner;
    let count = 0;
    while (true) {
      // eslint-disable-next-line no-unused-vars
      count++;
      newDeck = generateDeck();
      newPlayers = [];
      for (let i = 0; i < 9; i++) {
        newPlayers.push({
          name: "Player " + (i + 1),
          stack: 1000,
          cards: dealCards(newDeck, 2),
        });
      }
      newBoard = dealCards(newDeck, 5);
      // winner = findWinner(newPlayers, newBoard);
      // if (winner.type === "straight flush") break;
      break;
    }
    // setInspection(winner);
    setPot(0);
    setDeck(newDeck);
    setBoard(newBoard);
    setPlayers(newPlayers);
  }, []);

  const inspect = (position) => {
    const newInspection = evaluate(players[position].cards, board);
    newInspection.position = position;
    setInspection(newInspection);
  };

  const value = { deck, board, players, inspect, inspection, pot };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
