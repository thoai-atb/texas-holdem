import { useEffect, useState } from "react";
import { useAppContext } from "../../App";
import { useGame } from "../../contexts/Game";

export function TimeWaitToStartInfo() {
  const { gameStartTimeStamp, timeWaitToStart } = useGame();
  const { darkMode } = useAppContext();
  const [timeLeft, setTimeLeft] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(
        Math.ceil((gameStartTimeStamp + timeWaitToStart - Date.now()) / 1000)
      );
    }, 200);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [gameStartTimeStamp, timeWaitToStart]);

  return (
    gameStartTimeStamp && timeLeft >= 0 && (
      <div
        className={
          "opacity-30 tracking-wider text-2xl absolute top-20 text-center px-6 py-4 rounded-lg" +
          (darkMode ? " text-cyan-300 bg-black" : " text-black bg-white")
        }
      >
        Starting in {timeLeft} second(s)...
      </div>
    )
  );
}
