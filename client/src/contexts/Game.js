import React, { useEffect } from "react";
import { evaluate } from "../utilities/evaluator";
import { socket } from "../socket/socket";

const GameContext = React.createContext({});

export function GameProvider({ children }) {
  const [deck, setDeck] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [board, setBoard] = React.useState([]);
  const [inspection, setInspection] = React.useState();
  const [pot, setPot] = React.useState(0);
  const [seatIndex, setSeatIndex] = React.useState(0);
  const [turnIndex, setTurnIndex] = React.useState(0);
  const [buttonIndex, setButtonIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  useEffect(() => {
    socket.on("game_state", (gameState) => {
      setDeck(gameState.deck);
      setPlayers(gameState.players);
      setBoard(gameState.board);
      setTurnIndex(gameState.turnIndex);
      setButtonIndex(gameState.buttonIndex);
      setIsPlaying(gameState.playing);
    });
    socket.on("seat_index", (index) => {
      console.log("You are in seat: ", index);
      setSeatIndex(index);
    });
    setPot(0);
  }, []);

  const takeAction = (action) => {
    if (isPlaying && turnIndex !== seatIndex) return;
    socket.emit("player_action", action);
  };

  const inspect = (position) => {
    const newInspection = evaluate(players[position].cards, board);
    newInspection.position = position;
    setInspection(newInspection);
  };

  const value = {
    deck,
    board,
    players,
    inspection,
    pot,
    seatIndex,
    turnIndex,
    buttonIndex,
    takeAction,
    inspect,
  };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = React.useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
