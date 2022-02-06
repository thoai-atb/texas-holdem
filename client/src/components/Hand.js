import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";

export function Hand({ style, position }) {
  const { players, inspection, seatIndex, turnIndex, isPlaying } = useGame();
  const positionIndex = indexFromPosition(position, seatIndex);
  if (!players || !players[positionIndex]) return null;
  const handPlayer = players[positionIndex];
  const onClick = () => {
    // inspect(position);
  };
  return (
    <div
      className="w-0 h-0 flex justify-center items-center cursor-pointer"
      style={style}
      onClick={onClick}
    >
      <div
        className={
          (position === 0 ? " scale-125 box-border" : "") +
          (isPlaying && (handPlayer.cards.length === 0 || handPlayer.folded)
            ? " opacity-50"
            : "")
        }
      >
        <div
          className={
            "flex flex-row" +
            (inspection
              ? inspection.position === position
                ? ""
                : " opacity-50"
              : "")
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
        <div
          className={
            "bg-black text-center box-border text-white text-xl p-1 rounded-lg relative" +
            (turnIndex === positionIndex ? " text-lime-300 font-bold" : "")
          }
        >
          <div>${handPlayer.stack}</div>
          <div>{position === 0 ? "You" : "Player " + positionIndex}</div>
          {!isPlaying && handPlayer.ready && (
            <div
              className={
                "absolute bottom-full w-full h-18 bg-white text-black rounded-md"
              }
            >
              READY
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
