import React from "react";
import { useGame } from "../../contexts/Game";
import { indexFromPosition } from "../../utilities/position_converter";
import { AiOutlineCheckCircle } from "react-icons/ai";
import CountUp from "react-countup";
import { monetary } from "../../utilities/number";

export function Bets() {
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <Pot />
      <Bet style={{ bottom: "23%", left: "50%" }} position={0} />
      <Bet style={{ bottom: "27%", left: "30%" }} position={1} />
      <Bet style={{ bottom: "35%", left: "16%" }} position={2} />
      <Bet style={{ top: "35%", left: "16%" }} position={3} />
      <Bet style={{ top: "27%", left: "30%" }} position={4} />
      <Bet style={{ top: "32%", right: "30%" }} position={5} />
      <Bet style={{ top: "35%", right: "17%" }} position={6} />
      <Bet style={{ bottom: "35%", right: "16%" }} position={7} />
      <Bet style={{ bottom: "27%", right: "30%" }} position={8} />
    </div>
  );
}

function Bet({ style, position }) {
  const { seatIndex, bets, betTypes, MONEY_EFFECT_DURATION } = useGame();
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
            "rounded-lg text-center text-xl w-20 h-10 absolute flex items-center justify-center text-white font-bold border-dotted"
          }
          style={{
            borderWidth: "0.28rem",
            borderColor: borderFromAmount(amount),
            boxShadow: "0rem 0.5rem 0.3rem 0.1rem rgba(0, 0, 0, 0.2)",
            backgroundColor: colorFromAmount(amount),
          }}
        >
          $<CountUp formattingFn={monetary} end={amount} preserveValue={true} duration={MONEY_EFFECT_DURATION} />
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
  const { pot, MONEY_EFFECT_DURATION } = useGame();
  if (pot === 0) return null;
  return (
    <div
      className="absolute w-0 h-0 flex items-center justify-center"
      style={{ top: "15%", left: "50%" }}
    >
      <div
        className={
          "rounded-lg text-center text-xl h-10 absolute flex items-center justify-center text-white font-bold border-dotted"
        }
        style={{
          minWidth: "5rem",
          borderWidth: "0.28rem",
          borderColor: borderFromAmount(pot),
          boxShadow: "0rem 0.5rem 0.3rem 0.1rem rgba(0, 0, 0, 0.2)",
          backgroundColor: colorFromAmount(pot),
        }}
      >
        $<CountUp formattingFn={monetary} end={pot} preserveValue={true} duration={MONEY_EFFECT_DURATION} />
      </div>
    </div>
  );
}

var colors = [
  "#FF0000", // red
  "#FF8800", // orange
  "#FF00FF", // magenta
  "#57CC16", // lime
  "#8822FF", // purple blue
  "#ba3f3f", // brown
  "#000000", // black
];

var borderColors = [
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
  "#ffffff",
];

const colorFromAmount = (amount) => {
  let colorName = colors[amount % colors.length];
  return colorName;
};

const borderFromAmount = (amount) => {
  return borderColors[amount % borderColors.length];
};
