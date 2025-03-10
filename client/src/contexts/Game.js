import React, { useContext, useEffect } from "react";
import { AppContext } from "../App";
import { useSoundContext } from "./Sound";
const GameContext = React.createContext({});

export function GameProvider({ children }) {
  const {
    socket,
    autoCheckCall,
    autoCheckFold,
    appAction,
    setAppAction,
    setShowWorkPanel,
    coverCardMode,
  } = useContext(AppContext);
  const { playBubbleClick, playFlip } = useSoundContext();
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
  const [completeActionSeat, setCompleteActionSeat] = React.useState(-1);
  const [allPlayersAllIn, setAllPlayersAllIn] = React.useState(false);
  const [botsDefeated, setBotsDefeated] = React.useState(false);
  const [roundsPlayed, setRoundsPlayed] = React.useState(0);
  const [gameCreationTimeStamp, setGameCreationTimeStamp] = React.useState();
  const [botDefeatedList, setBotDefeatedList] = React.useState();
  const [gameTheme, setGameTheme] = React.useState("default");
  const [gameStartTimeStamp, setGameStartTimeStamp] = React.useState(null);
  const [timeWaitToStart, setTimeWaitToStart] = React.useState(0);
  const [coverCard, setCoverCard] = React.useState(true); // The actual state of the cover card

  const MONEY_EFFECT_DURATION = 0.5;

  useEffect(() => {
    socket.on("game_state", (gameState) => {
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
      setCompleteActionSeat(gameState.completeActionSeat);
      setAllPlayersAllIn(gameState.allPlayersAllIn);
      setGameStartTimeStamp(gameState.gameStartTimeStamp);
    });
    socket.on("game_statistics", (statistics) => {
      setBotsDefeated(statistics.botsDefeated);
      setRoundsPlayed(statistics.roundsPlayed);
      setGameCreationTimeStamp(statistics.gameCreationTimeStamp);
      setBotDefeatedList(statistics.botDefeatedList);
    });
    socket.on("game_settings", (settings) => {
      setGameTheme(settings.gameTheme);
      setDebugMode(settings.debugMode);
      setTimeWaitToStart(settings.timeWaitToStart);
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

  // Keyboard shortcuts
  useEffect(() => {
    if (appAction === "space_pressed") {
      setAppAction(null);
      if (!players || !players[seatIndex]) return;
      const thisPlayer = players[seatIndex];
      if (!isPlaying && !thisPlayer.ready) {
        if (thisPlayer.stack >= bigblindSize) {
          playBubbleClick();
          takeAction({ type: "ready" });
          return;
        }
      }
      if (!thisPlayer.ready && !thisPlayer.working) {
        if (thisPlayer.stack < bigblindSize) {
          playBubbleClick();
          setShowWorkPanel(true);
          return;
        }
      }
      if (turnIndex === seatIndex)
        for (const action of availableActions) {
          if (action.type === "check") {
            playBubbleClick();
            takeAction(action);
            return;
          } else if (action.type === "call") {
            playBubbleClick();
            takeAction(action);
            return;
          }
        }
    }
    if (appAction === "f_pressed") {
      setAppAction(null);
      if (turnIndex === seatIndex)
        for (const action of availableActions) {
          if (action.type === "fold") {
            playBubbleClick();
            takeAction(action);
            return;
          }
        }
    }
    if (appAction === "shift_pressed") {
      setAppAction(null);
      if (coverCardMode)
        playFlip();
      setCoverCard(false);
    }
    if (appAction === "shift_released") {
      setAppAction(null);
      setCoverCard(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    appAction,
    turnIndex,
    setAppAction,
    availableActions,
    bigblindSize,
    isPlaying,
    playFlip,
    players,
    seatIndex,
    setShowWorkPanel,
  ]);

  const value = {
    socket,

    // Game state & settings (start)
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
    completeActionSeat,
    allPlayersAllIn,
    botsDefeated,
    roundsPlayed,
    gameCreationTimeStamp,
    botDefeatedList,
    gameTheme,
    gameStartTimeStamp,
    timeWaitToStart,
    // Game state & settings (end)

    coverCard,
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
