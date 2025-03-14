import { createContext, useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { ActionBar } from "./components/ui/ActionBar";
import { Chat } from "./components/ui/Chat";
import MenuBar from "./components/ui/MenuBar";
import { Table } from "./components/game-play/Table";
import { GameProvider } from "./contexts/Game";
import LoginPage from "./pages/LoginPage";
import { getSocket } from "./socket/socket";
import { useSoundHandler } from "./hooks/useSoundHandler";
import { SoundContext } from "./contexts/Sound";
import { Info } from "./components/ui/Info";
import { ControlPanel } from "./components/ui/ControlPanel";
import { HandStatistics } from "./components/ui/HandStatistics";
import { Settings } from "./components/ui/Settings";
import { Logout } from "./components/ui/Logout";
import { FirstPlayerDialog } from "./components/ui/FirstPlayerDialog";
import { DebugPanel } from "./components/ui/DebugPanel";
import { WorkPanel } from "./components/ui/WorkPanel";
import { Statistics } from "./components/ui/StatisticsPanel";
import { GameRule } from "./components/ui/GameRule";
import { Decoration } from "./components/ui/decoration/Decoration";
import { Donation } from "./components/ui/Donation";
import { GameStartCountDown } from "./components/ui/GameStartCountDown";

export const AppContext = createContext({});
export const useAppContext = () => useContext(AppContext);

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chatHidden, setChatHidden] = useState(true);
  const [enteringCommand, setEnteringCommand] = useState(false); // Enter chat directly when pressed "/"
  const [chatHint, setChatHint] = useState("- Press T to chat -");
  const [muted, setMuted] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showGameRule, setShowGameRule] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showHandStatistics, setShowHandStatistics] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [autoCheckCall, setAutoCheckCall] = useState(false);
  const [autoCheckFold, setAutoCheckFold] = useState(false);
  const [disableShortcuts, setDisableShortcuts] = useState(false); // Don't activate shortcuts while using chat and others
  const [showLogout, setShowLogout] = useState(false);
  const [showFirstPlayerDialog, setShowFirstPlayerDialog] = useState(false); // Ask player if they want to play with bots
  const [showWorkPanel, setShowWorkPanel] = useState(false); // work for money, money is life
  const [appAction, setAppAction] = useState(null); // events for app's children - such as keyboard shortcuts
  const [darkMode, setDarkMode] = useState(true);
  const [donationSelection, setDonationSelection] = useState(-1);
  const [showDonation, setShowDonation] = useState(false);
  const [coverCardMode, setCoverCardMode] = useState(false); // The mode to hide the player's cards from others sitting nearby the monitor

  const { localStorage } = window;
  const containerRef = useRef(null);

  useEffect(() => {
    if (donationSelection >= 0) setShowDonation(true);
    else setShowDonation(false);
  }, [donationSelection]);

  const {
    playBubbleClick,
    playBubbleChat,
    playStickClick,
    playFlip,
    playMiscSound,
    volume,
    setVolume,
  } = useSoundHandler({
    socket,
    muted,
  });

  const login = (name, address, onFail) => {
    localStorage.setItem("userName", name);
    localStorage.setItem("serverAddress", address);
    if (!address) address = "/";
    const socket = getSocket(name, address);
    socket.on("connect", () => {
      setLoggedIn(true);
    });
    socket.on("connect_error", () => {
      alert("Could not connect to server!");
      onFail();
    });
    socket.on("disconnect", () => {
      alert("Disconnected from server!");
      setLoggedIn(false);
    });
    // custom event disconnect_reason - game play related (kicked, table was full)
    socket.on("disconnect_reason", (disconnectReason) => {
      alert("Server: " + disconnectReason);
      socket.disconnect(); // disconnection comes from client
    });
    setSocket(socket);
  };

  useEffect(() => {
    if (showControlPanel || !chatHidden) setDisableShortcuts(true);
    else setDisableShortcuts(false);
  }, [chatHidden, showControlPanel]);

  useEffect(() => {
    const keyDown = (e) => {
      if (!loggedIn) return;
      if (disableShortcuts) return;
      if (e.key === "t" || e.key === "T" || e.key === "`") {
        setChatHidden(false);
      }
      if (e.key === "/") {
        setEnteringCommand(true);
        setChatHidden(false);
      }
      if (e.key === "r" || e.key === "R") {
        playStickClick();
        setShowHandStatistics((show) => !show);
      }
      if (e.key === "d" || e.key === "D") {
        playStickClick();
        setDarkMode((d) => !d);
      }
      if (e.key === "f" || e.key === "F") {
        setAppAction("f_pressed");
      }
      if (e.key === "s" || e.key === "S") {
        setAppAction("s_pressed");
      }
      if (e.key === "w" || e.key === "W") {
        setAppAction("w_pressed");
      }
      if (e.key === "c" || e.key === "C") {
        playStickClick();
        setCoverCardMode((show) => !show);
      }
      if (e.key === " ") {
        setAppAction("space_pressed");
      }
      if (e.key === "Escape") {
        setAppAction("escape_pressed");
      }
      if (e.key === "Enter") {
        setAppAction("enter_pressed");
      }
      if (e.key === "Shift") {
        setAppAction("shift_pressed");
      }
    };
    const keyUp = (e) => {
      if (!loggedIn) return;
      if (disableShortcuts) return;
      if (e.key === "Shift") {
        setAppAction("shift_released");
      }
    };
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    return () => {
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
    };
  }, [loggedIn, chatHidden, playStickClick, disableShortcuts]);

  useEffect(() => {
    if (chatHidden) containerRef?.current?.focus();
    else setChatHint("");
  }, [chatHidden]);

  useEffect(() => {
    if (autoCheckCall) setAutoCheckFold(false);
  }, [autoCheckCall]);

  useEffect(() => {
    if (autoCheckFold) setAutoCheckCall(false);
  }, [autoCheckFold]);

  useEffect(() => {
    if (!chatHidden) {
      setShowStatistics(false);
      setShowControlPanel(false);
      setShowInfo(false);
      setShowSettings(false);
      setShowGameRule(false);
    }
  }, [chatHidden]);

  return (
    <AppContext.Provider
      value={{
        socket,
        chatHidden,
        chatHint,
        muted,
        showInfo,
        showControlPanel,
        showHandStatistics,
        showSettings,
        autoCheckCall,
        autoCheckFold,
        showLogout,
        showFirstPlayerDialog,
        showWorkPanel,
        showGameRule,
        appAction,
        darkMode,
        donationSelection,
        showDonation,
        coverCardMode,
        setAutoCheckCall,
        setAutoCheckFold,
        setMuted,
        setShowSettings,
        setShowHandStatistics,
        setShowLogout,
        setShowFirstPlayerDialog,
        setShowWorkPanel,
        setAppAction,
        setDarkMode,
        setShowGameRule,
        setDonationSelection,
        setShowDonation,
        setCoverCardMode,
      }}
    >
      <SoundContext.Provider
        value={{
          playBubbleClick,
          playBubbleChat,
          playStickClick,
          playFlip,
          playMiscSound,
          volume,
          setVolume,
        }}
      >
        <div
          className={
            "relative w-sceen h-screen bg-gradient-to-r" +
            (darkMode
              ? " from-slate-700 to-gray-900"
              : " from-amber-200 to-pink-200")
          }
        >
          {!loggedIn && <LoginPage loginFunction={login} />}
          {loggedIn && (
            <div>
              <GameProvider>
                <div className="absolute w-full h-full justify-center items-center flex pb-28 overflow-hidden">
                  <Decoration />
                </div>
                <div className="absolute w-full h-full justify-center items-center flex pb-28">
                  <Table />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <ActionBar />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <MenuBar
                    toggleChat={() => setChatHidden((hid) => !hid)}
                    toggleStatistics={() => setShowStatistics((hid) => !hid)}
                    toggleInfo={() => setShowInfo((show) => !show)}
                    toggleControlPanel={() =>
                      setShowControlPanel((show) => !show)
                    }
                    toggleGameRule={() => setShowGameRule((show) => !show)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <WorkPanel
                    hidden={!showWorkPanel}
                    setHidden={(hidden) => setShowWorkPanel(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <Statistics
                    hidden={!showStatistics}
                    setHidden={(hidden) => setShowStatistics(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <Info
                    hidden={!showInfo}
                    setHidden={(hidden) => setShowInfo(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <GameRule
                    hidden={!showGameRule}
                    setHidden={(hidden) => setShowGameRule(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <ControlPanel
                    hidden={!showControlPanel}
                    setHidden={(hidden) => setShowControlPanel(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <Donation
                    hidden={!showDonation}
                    setHidden={(hidden) => hidden && setDonationSelection(-1)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <HandStatistics
                    hidden={!showHandStatistics}
                    setHidden={(hidden) => setShowHandStatistics(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  {chatHint && (
                    <div
                      className={
                        "opacity-30 tracking-wider uppercase text-2xl absolute top-4 text-center" +
                        (darkMode ? " text-cyan-300" : " text-black")
                      }
                    >
                      {chatHint}
                    </div>
                  )}
                  <Chat
                    hidden={chatHidden}
                    setHidden={setChatHidden}
                    enteringCommand={enteringCommand}
                    setEnteringCommand={setEnteringCommand}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <GameStartCountDown />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <Settings />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <Logout />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <FirstPlayerDialog />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <DebugPanel />
                </div>
              </GameProvider>
            </div>
          )}
          <div
            className={
              "absolute bottom-2 left-2" +
              (darkMode ? " text-cyan-300" : " text-slate-700")
            }
          >
            &copy; 2022 Thoai Ly
          </div>
        </div>
      </SoundContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
