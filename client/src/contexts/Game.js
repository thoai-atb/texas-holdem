import React, { useEffect } from "react";
import { evaluate } from "../utilities/evaluator";
import { positionFromIndex } from "../utilities/position_converter";

const GameContext = React.createContext({});

export function GameProvider({ children, socket }) {
  const [deck, setDeck] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [bets, setBets] = React.useState([]);
  const [betTypes, setBetTypes] = React.useState([]);
  const [board, setBoard] = React.useState([]);
  const [inspection, setInspection] = React.useState();
  const [pot, setPot] = React.useState(0);
  const [seatIndex, setSeatIndex] = React.useState(0);
  const [turnIndex, setTurnIndex] = React.useState(0);
  const [buttonIndex, setButtonIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentBetSize, setCurrentBetSize] = React.useState(0);
  const [showDown, setShowDown] = React.useState(false);

  useEffect(() => {
    socket.on("game_state", (gameState) => {
      setDeck(gameState.deck);
      setPlayers(gameState.players);
      setBets(gameState.bets);
      setBetTypes(gameState.betTypes);
      setBoard(gameState.board);
      setTurnIndex(gameState.turnIndex);
      setButtonIndex(gameState.buttonIndex);
      setIsPlaying(gameState.playing);
      setCurrentBetSize(gameState.currentBetSize);
      setPot(gameState.pot);
      setShowDown(gameState.showDown);

      if (gameState.winner)
        setInspection({
          ...gameState.winner,
          position: positionFromIndex(gameState.winner.index, seatIndex),
        });
      else setInspection(null);
    });
    socket.on("seat_index", (index) => {
      console.log("You are in seat: ", index);
      setSeatIndex(index);
    });
    socket.emit("info_request");
  }, [seatIndex, socket]);

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
    bets,
    betTypes,
    inspection,
    pot,
    seatIndex,
    turnIndex,
    buttonIndex,
    isPlaying,
    currentBetSize,
    showDown,
    takeAction,
    inspect,
    socket,
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
