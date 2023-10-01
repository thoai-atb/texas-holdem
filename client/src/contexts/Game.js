import React, { useContext, useEffect } from "react";
import { AppContext } from "../App";

const GameContext = React.createContext({});

export function GameProvider({ children }) {
  const { socket, autoCheckCall, autoCheckFold } = useContext(AppContext);
  const [deck, setDeck] = React.useState([]);
  const [players, setPlayers] = React.useState([]);
  const [bets, setBets] = React.useState([]);
  const [betTypes, setBetTypes] = React.useState([]);
  const [playersRanking, setPlayersRanking] = React.useState([]);
  const [board, setBoard] = React.useState([]);
  const [winners, setWinners] = React.useState([]);
  const [pot, setPot] = React.useState(0);
  const [seatIndex, setSeatIndex] = React.useState(0);
  const [turnIndex, setTurnIndex] = React.useState(0);
  const [buttonIndex, setButtonIndex] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentBetSize, setCurrentBetSize] = React.useState(0);
  const [showDown, setShowDown] = React.useState(false);
  const [availableActions, setAvailableActions] = React.useState([]);
  const [bigblindSize, setBigblindSize] = React.useState(0);
  const [debugMode, setDebugMode] = React.useState(false);

  const MONEY_EFFECT_DURATION = 0.5;

  useEffect(() => {
    socket.on("game_state", (gameState) => {
      if (gameState.debugMode) console.log("game state update", { gameState });
      setDeck(gameState.deck);
      setPlayers(gameState.players);
      setBets(gameState.bets);
      setBetTypes(gameState.betTypes);
      setPlayersRanking(gameState.playersRanking);
      setBoard(gameState.board);
      setTurnIndex(gameState.turnIndex);
      setButtonIndex(gameState.buttonIndex);
      setIsPlaying(gameState.playing);
      setCurrentBetSize(gameState.currentBetSize);
      setPot(gameState.pot);
      setShowDown(gameState.showDown);
      setAvailableActions(gameState.availableActions);
      setBigblindSize(gameState.bigblindSize);
      setWinners(gameState.winners);
      setDebugMode(gameState.debugMode);
    });
    socket.on("seat_index", (index) => {
      setSeatIndex(index);
    });
    socket.emit("info_request");
  }, [seatIndex, socket]);

  // UPDATE TITLE
  useEffect(() => {
    let title = "";
    if (board.length > 0) {
      for (const card of board) {
        title += card.value + card.suit + " ";
      }
    }
    if (seatIndex === turnIndex) {
      title += "Your Turn!";
    }
    if (winners.length >= 1) {
      title += players[winners[0].index].name + " wins!";
    }
    if (title) document.title = title;
    else document.title = "Texas Hold'em Abis";
  }, [board, players, seatIndex, turnIndex, winners]);

  const takeAction = (action) => {
    if (isPlaying && turnIndex !== seatIndex) return;
    socket.emit("player_action", action);
  };

  // AFK MODE
  useEffect(() => {
    if (autoCheckCall || autoCheckFold) {
      if (!players || !players[seatIndex]) return;
      const thisPlayer = players[seatIndex];
      if (!isPlaying && !thisPlayer.ready && thisPlayer.stack >= bigblindSize) {
        takeAction({ type: "ready" });
      }
    }
    if (autoCheckFold)
      for (const action of availableActions) {
        if (action.type === "check") takeAction(action);
        else if (action.type === "fold") takeAction(action);
      }
    if (autoCheckCall)
      for (const action of availableActions) {
        if (action.type === "check") takeAction(action);
        else if (action.type === "call") takeAction(action);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    availableActions,
    autoCheckCall,
    autoCheckFold,
    players,
    seatIndex,
    isPlaying,
    bigblindSize,
  ]);

  const value = {
    socket,
    deck,
    board,
    players,
    bets,
    betTypes,
    playersRanking,
    pot,
    seatIndex,
    turnIndex,
    buttonIndex,
    isPlaying,
    currentBetSize,
    showDown,
    availableActions,
    bigblindSize,
    winners,
    debugMode,
    takeAction,
    MONEY_EFFECT_DURATION,
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
