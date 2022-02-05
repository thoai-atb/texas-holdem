import "./App.css";
import { Table } from "./components/Table";
import { GameProvider } from "./contexts/Game";

function App() {
  return (
    <GameProvider>
      <div className="w-sceen h-screen bg-gradient-to-r from-amber-200 to-pink-200 justify-center items-center flex">
        <Table />
      </div>
    </GameProvider>
  );
}

export default App;
