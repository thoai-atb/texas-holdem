import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";

export function Hand({ style, position }) {
  const {
    players,
    inspection,
    seatIndex,
    turnIndex,
    isPlaying,
    showDown,
    betTypes,
  } = useGame();
  const positionIndex = indexFromPosition(position, seatIndex);
  if (!players || !players[positionIndex]) return null;
  const handPlayer = players[positionIndex];
  const actionType = handPlayer.folded ? "fold" : betTypes[positionIndex];
  const onClick = () => {
    // inspect(position);
  };
  return (
    <div
      className={"w-0 h-0 flex justify-center items-center cursor-pointer"}
      style={style}
      onClick={onClick}
    >
      <div
        className={
          "flex justify-center items-center flex-col " +
          (position === 0 ? " scale-125 box-border" : "") +
          (inspection
            ? inspection.position === position
              ? ""
              : " opacity-50"
            : "")
        }
      >
        {!handPlayer.folded && (
          <div className={"flex flex-row translate-y-3"}>
            {players[positionIndex].cards.map((card, index) => (
              <Card
                key={index}
                card={card}
                hidden={!showDown && position !== 0}
              />
            ))}
          </div>
        )}
        <div
          className={
            "bg-black text-center text-white text-xl pb-1 rounded-lg relative border-gray-800 transition duration-300" +
            (turnIndex === positionIndex
              ? " bg-lime-300 text-gray-800 border-2 font-bold"
              : "")
          }
          style={{
            width: "9rem",
            height: "3.8rem",
          }}
        >
          <div>
            ${handPlayer.stack}
            <span style={{ fontSize: "1em" }}>
              {turnIndex !== positionIndex &&
                actionType &&
                actionType !== "blind" &&
                ` | ${actionType.toUpperCase()}`}
            </span>
          </div>
          <div>{handPlayer.name}</div>
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
