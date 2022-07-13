import { createContext, useEffect, useRef, useState } from "react";
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
import { Statistics } from "./components/ui/Statistics";
import { Settings } from "./components/ui/Settings";
import { Logout } from "./components/ui/Logout";
import { FirstPlayerDialog } from "./components/ui/FirstPlayerDialog";

export const AppContext = createContext({});

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chatHidden, setChatHidden] = useState(true);
  const [chatHint, setChatHint] = useState("- Press T to chat -");
  const [muted, setMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoCheckCall, setAutoCheckCall] = useState(false);
  const [autoCheckFold, setAutoCheckFold] = useState(false);
  const [disableShortcuts, setDisableShortcuts] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showFirstPlayerDialog, setShowFirstPlayerDialog] = useState(false);
  const containerRef = useRef(null);

  const { playBubbleClick, playStickClick, volume, setVolume } =
    useSoundHandler({
      socket,
      muted,
    });

  const login = (name, address, onFail) => {
    address = address || "http://localhost:8000";
    const socket = getSocket(name, address);
    socket.on("connect", () => {
      setLoggedIn(true);
    });
    socket.on("connect_error", () => {
      alert("Can't connect to server!");
      onFail();
    });
    socket.on("disconnect", () => {
      alert("Disconnected from server!");
      setLoggedIn(false);
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
      if (e.key === "r" || e.key === "R") {
        playStickClick();
        setShowStatistics((show) => !show);
      }
      if (e.key === "c" || e.key === "C") {
        playStickClick();
        setAutoCheckCall((c) => !c);
      }
      if (e.key === "f" || e.key === "F") {
        playStickClick();
        setAutoCheckFold((c) => !c);
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
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

  return (
    <AppContext.Provider
      value={{
        socket,
        chatHidden,
        chatHint,
        muted,
        showInfo,
        showControlPanel,
        showStatistics,
        showSettings,
        autoCheckCall,
        autoCheckFold,
        showLogout,
        showFirstPlayerDialog,
        setAutoCheckCall,
        setAutoCheckFold,
        setMuted,
        setShowSettings,
        setShowStatistics,
        setShowLogout,
        setShowFirstPlayerDialog,
      }}
    >
      <SoundContext.Provider
        value={{ playBubbleClick, playStickClick, volume, setVolume }}
      >
        <div className="relative w-sceen h-screen bg-gradient-to-r from-amber-200 to-pink-200">
          {!loggedIn && <LoginPage loginFunction={login} />}
          {loggedIn && (
            <div>
              <GameProvider>
                <div className="absolute w-full h-full justify-center items-center flex pb-28">
                  <Table />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <ActionBar />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <MenuBar
                    toggleChat={() => setChatHidden((hid) => !hid)}
                    toggleInfo={() => setShowInfo((show) => !show)}
                    toggleControlPanel={() =>
                      setShowControlPanel((show) => !show)
                    }
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  {chatHint && (
                    <div className="text-black opacity-30 tracking-wider uppercase text-2xl absolute top-4 text-center">
                      {chatHint}
                    </div>
                  )}
                  <Chat hidden={chatHidden} setHidden={setChatHidden} />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <Info
                    hidden={!showInfo}
                    setHidden={(hidden) => setShowInfo(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-center items-center pointer-events-none">
                  <ControlPanel
                    hidden={!showControlPanel}
                    setHidden={(hidden) => setShowControlPanel(!hidden)}
                  />
                </div>
                <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                  <Statistics
                    hidden={!showStatistics}
                    setHidden={(hidden) => setShowStatistics(!hidden)}
                  />
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
              </GameProvider>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-slate-700">
            @ 2022 Thoai Ly. All Rights Reserved.
          </div>
        </div>
      </SoundContext.Provider>
    </AppContext.Provider>
  );
}

export default App;
