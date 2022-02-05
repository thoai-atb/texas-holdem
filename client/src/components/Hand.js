import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";

export function Hand({ style, position }) {
  const { players, inspect, inspection, seatIndex, turnIndex } = useGame();
  const positionIndex = indexFromPosition(position, seatIndex);
  if (!players || !players[positionIndex]) return null;
  const handPlayer = players[positionIndex];
  const onClick = () => {
    inspect(position);
  };
  return (
    <div
      className="w-0 h-0 flex justify-center items-center cursor-pointer"
      style={style}
      onClick={onClick}
    >
      <div className={position === 0 ? " scale-125" : ""}>
        <div
          className={
            "flex flex-row" +
            (inspection
              ? inspection.position === position
                ? ""
                : " opacity-50"
              : "") +
            (turnIndex === positionIndex ? " border-2 border-yellow-400" : "")
          }
        >
          {players[positionIndex].cards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
          {new Array(2 - players[positionIndex].cards.length)
            .fill(null)
            .map((_, index) => (
              <Card key={index} card={null} />
            ))}
        </div>
        <div className={"bg-black text-center text-white text-xl rounded-lg"}>
          <div>${handPlayer.stack}</div>
          <div>{position === 0 ? "You" : "Player " + positionIndex}</div>
        </div>
      </div>
    </div>
  );
}
