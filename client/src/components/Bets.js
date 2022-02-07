import React from "react";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";
import { AiOutlineCheckCircle } from "react-icons/ai";

export function Bets() {
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <Pot />
      <Bet style={{ bottom: "23%", left: "50%" }} position={0} />
      <Bet style={{ bottom: "27%", left: "30%" }} position={1} />
      <Bet style={{ bottom: "35%", left: "16%" }} position={2} />
      <Bet style={{ top: "35%", left: "16%" }} position={3} />
      <Bet style={{ top: "27%", left: "30%" }} position={4} />
      <Bet style={{ top: "27%", right: "30%" }} position={5} />
      <Bet style={{ top: "35%", right: "16%" }} position={6} />
      <Bet style={{ bottom: "35%", right: "16%" }} position={7} />
      <Bet style={{ bottom: "27%", right: "30%" }} position={8} />
    </div>
  );
}

function Bet({ style, position }) {
  const { seatIndex, bets, betTypes } = useGame();
  const index = indexFromPosition(position, seatIndex);
  const amount = bets[index];
  const betType = betTypes[index];
  if (!betType) return null;
  return (
    <div
      className="absolute w-0 h-0 flex items-center justify-center"
      style={style}
    >
      {amount > 0 && (
        <div
          className={
            "rounded-lg text-center text-xl w-20 h-10 absolute flex items-center justify-center text-white font-bold border-2 border-white border-dotted"
          }
          style={{
            backgroundColor: colorFromAmount(amount),
          }}
        >
          ${amount}
        </div>
      )}
      {betType === "check" && amount === 0 && (
        <div className="text-5xl text-slate-700">
          <AiOutlineCheckCircle />
        </div>
      )}
    </div>
  );
}

function Pot() {
  const { pot } = useGame();
  if (pot === 0) return null;
  return (
    <div
      className="absolute w-0 h-0 flex items-center justify-center"
      style={{ top: "15%", left: "50%" }}
    >
      <div
        className={
          "rounded-lg text-center text-xl w-20 h-10 absolute flex items-center justify-center text-white font-bold border-2 border-white border-dotted"
        }
        style={{
          backgroundColor: colorFromAmount(pot),
        }}
      >
        ${pot}
      </div>
    </div>
  );
}

var colors = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#84CC16",
  "#10B981",
  "#0EA5E9",
  "#8B5CF6",
];

const colorFromAmount = (amount) => {
  let colorName = colors[amount % colors.length];
  return colorName;
};
