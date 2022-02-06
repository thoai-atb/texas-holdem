import React from "react";
import { useGame } from "../contexts/Game";

export function Bets() {
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <Pot />
    </div>
  );
}

function Pot() {
  const { pot } = useGame();
  if (pot === 0) return null;
  return (
    <div
      className="absolute w-0 h-0 flex items-center justify-center"
      style={{ top: "20%", left: "50%" }}
    >
      <div className="bg-white rounded-lg text-center w-20 h-10 absolute flex items-center justify-center">
        ${pot}
      </div>
    </div>
  );
}
