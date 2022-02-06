import React from "react";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";

export function Bets() {
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <Pot />
      <Bet style={{ bottom: "23%", left: "50%" }} position={0} />
      <Bet style={{ bottom: "25%", left: "30%" }} position={1} />
      <Bet style={{ bottom: "35%", left: "16%" }} position={2} />
      <Bet style={{ top: "35%", left: "16%" }} position={3} />
      <Bet style={{ top: "25%", left: "30%" }} position={4} />
      <Bet style={{ top: "25%", right: "30%" }} position={5} />
      <Bet style={{ top: "35%", right: "16%" }} position={6} />
      <Bet style={{ bottom: "35%", right: "16%" }} position={7} />
      <Bet style={{ bottom: "25%", right: "30%" }} position={8} />
    </div>
  );
}

function Bet({ style, position }) {
  const { seatIndex, bets, betTypes } = useGame();
  const index = indexFromPosition(position, seatIndex);
  const amount = bets[index];
  const betType = betTypes[index];
  if (amount === 0) return null;
  if (!betType) return null;
  return (
    <div
      className="absolute w-0 h-0 flex items-center justify-center"
      style={style}
    >
      <div
        className={
          "rounded-lg text-center text-xl w-20 h-10 absolute flex items-center justify-center text-white font-bold border-2 border-white border-dotted" +
          (betType === "call" ? " bg-lime-500" : " bg-cyan-500")
        }
      >
        ${amount}
      </div>
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
      <div className="bg-yellow-500 rounded-lg text-center text-xl w-20 h-10 absolute flex items-center justify-center text-white font-bold border-2 border-white border-dotted">
        ${pot}
      </div>
    </div>
  );
}
