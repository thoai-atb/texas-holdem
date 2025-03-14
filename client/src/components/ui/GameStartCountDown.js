import { useAppContext } from "../../App";
import { useGame } from "../../contexts/Game";

export function GameStartCountDown() {
  const { gameStartCountDown } = useGame();
  const { darkMode } = useAppContext();

  return (
    gameStartCountDown >= 0 && (
      <div
        className={
          "opacity-30 tracking-wider text-2xl absolute top-20 text-center px-6 py-4 rounded-lg" +
          (darkMode ? " text-cyan-300 bg-black" : " text-black bg-white")
        }
      >
        Starting in {gameStartCountDown} second(s)
      </div>
    )
  );
}
