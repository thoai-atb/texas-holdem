import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";
import {
  indexFromPosition,
  positionFromIndex,
} from "../utilities/position_converter";
import { ChatBubble } from "./ChatBubble";

export function Hand({ style, position }) {
  const {
    players,
    winners,
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
  return (
    <div
      className={"w-0 h-0 flex justify-center items-center cursor-pointer"}
      style={style}
    >
      <div
        className={
          "flex justify-center items-center flex-col box-border relative overflow-x-visible" +
          (position === 0 ? " scale-125" : "") +
          (winners.length > 0
            ? winners.some(
                (winner) =>
                  positionFromIndex(winner.index, seatIndex) === position
              )
              ? ""
              : " opacity-50"
            : "")
        }
      >
        {(!handPlayer.folded || position === 0) && (
          <div
            className={
              "flex flex-row translate-y-3" +
              (handPlayer.folded ? " opacity-50" : "")
            }
          >
            {handPlayer.cards.map((card, index) => (
              <Card
                key={index}
                card={card}
                hidden={!showDown && position !== 0}
                // hidden={false}
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
        <ChatBubble
          seatIndex={positionIndex}
          offset={(() => {
            if (handPlayer.folded || !handPlayer.cards.length) {
              if (!isPlaying && handPlayer.ready) return 3;
              return 1.5;
            }
            return 0.3;
          })()}
        />
      </div>
    </div>
  );
}
