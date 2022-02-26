import { useEffect, useRef, useState } from "react";
import "./App.css";
import { ActionBar } from "./components/ActionBar";
import { Chat } from "./components/Chat";
import MenuBar from "./components/MenuBar";
import { Table } from "./components/Table";
import { GameProvider } from "./contexts/Game";
import LoginPage from "./pages/LoginPage";
import { getSocket } from "./socket/socket";
import { useSoundHandler } from "./hooks/useSoundHandler";
import { SoundContext } from "./contexts/Sound";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chatHidden, setChatHidden] = useState(true);
  const [chatHint, setChatHint] = useState("- Press T to chat -");
  const [muted, setMuted] = useState(false);
  const containerRef = useRef(null);

  const { playBubbleClick, playStickClick } = useSoundHandler({
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
    const keyDown = (e) => {
      if (!loggedIn) return;
      if (e.key === "t" || e.key === "T" || e.key === "`") {
        setChatHidden(false);
      }
    };
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, [loggedIn]);

  useEffect(() => {
    if (chatHidden) containerRef?.current?.focus();
    else setChatHint("");
  }, [chatHidden]);

  return (
    <SoundContext.Provider value={{ playBubbleClick, playStickClick }}>
      <div className="relative w-sceen h-screen bg-gradient-to-r from-amber-200 to-pink-200">
        {!loggedIn && <LoginPage loginFunction={login} />}
        {loggedIn && (
          <div>
            <GameProvider socket={socket}>
              <div className="absolute w-full h-full justify-center items-center flex pb-28">
                <Table />
              </div>
              <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                <ActionBar />
              </div>
              <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
                <MenuBar
                  toggleChat={() => setChatHidden((hid) => !hid)}
                  toggleMuted={() => setMuted((mute) => !mute)}
                  isMuted={muted}
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
            </GameProvider>
          </div>
        )}
        <div className="absolute bottom-2 left-2 text-slate-700">
          @ 2022 Thoai Ly. All Rights Reserved.
        </div>
      </div>
    </SoundContext.Provider>
  );
}

export default App;
