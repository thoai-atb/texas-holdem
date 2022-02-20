import "./App.css";
import { Table } from "./components/Table";
import { ActionBar } from "./components/ActionBar";
import { GameProvider } from "./contexts/Game";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "./socket/socket";
import LoginPage from "./pages/LoginPage";
import { Chat } from "./components/Chat";
import MenuBar from "./components/MenuBar";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [chatHidden, setChatHidden] = useState(true);
  const [chatHint, setChatHint] = useState("- Press T to chat -");
  const containerRef = useRef(null);

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
              <MenuBar />
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
  );
}

export default App;
