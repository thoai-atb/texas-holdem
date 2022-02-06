import "./App.css";
import { Table } from "./components/Table";
import { ActionBar } from "./components/ActionBar";
import { GameProvider } from "./contexts/Game";
import { useState } from "react";
import { getSocket } from "./socket/socket";
import LoginPage from "./pages/LoginPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const login = (name, address) => {
    address = address || "http://localhost:8000";
    const socket = getSocket(name, address);
    socket.on("connect", () => {
      setLoggedIn(true);
    });
    socket.on("connect_error", () => {
      alert("Can't connect to server!");
    });
    socket.on("disconnect", () => {
      alert("Disconnected from server!");
      setLoggedIn(false);
    })
    setSocket(socket);
  };
  return (
    <div className="relative w-sceen h-screen bg-gradient-to-r from-amber-200 to-pink-200">
      {!loggedIn && <LoginPage loginFunction={login} />}
      {loggedIn && (
        <>
          <GameProvider socket={socket}>
            <div className="absolute w-full h-full justify-center items-center flex pb-28">
              <Table />
            </div>
            <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
              <ActionBar />
            </div>
          </GameProvider>
        </>
      )}
    </div>
  );
}

export default App;
