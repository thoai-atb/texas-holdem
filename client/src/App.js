import "./App.css";
import { Table } from "./components/Table";
import { Toolbar } from "./components/Toolbar";
import { GameProvider } from "./contexts/Game";

function App() {
  return (
    <GameProvider>
      <div className="relative w-sceen h-screen bg-gradient-to-r from-amber-200 to-pink-200">
        <div className="absolute w-full h-full justify-center items-center flex pb-28">
          <Table />
        </div>
        <div className="absolute w-full h-full flex flex-col justify-end pointer-events-none">
          <Toolbar />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;
