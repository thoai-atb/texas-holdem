import React from "react";
import CountUp from 'react-countup';
import { useGame } from "../../contexts/Game";
import {
  indexFromPosition,
  positionFromIndex
} from "../../utilities/position_converter";
import { Card } from "./Card";
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
    bigblindSize,
    MONEY_EFFECT_DURATION,
  } = useGame();
  const positionIndex = indexFromPosition(position, seatIndex);
  if (!players || !players[positionIndex]) return null;
  const handPlayer = players[positionIndex];
  const actionType = handPlayer.folded ? "fold" : betTypes[positionIndex];
  const isBroke = !handPlayer.cards?.length && handPlayer.stack < bigblindSize;
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
              ? " bg-lime-300 text-gray-800 font-bold"
              : "") +
            (isBroke ? " text-red-500" : "")
          }
          style={{
            width: "9rem",
            height: "3.8rem",
            borderWidth: turnIndex === positionIndex ? "0.2rem" : "0rem",
          }}
        >
          <div className="absolute right-full top-full -translate-y-2/3 translate-x-1/3 rounded-full border-black border overflow-hidden w-12 h-12">
            <img src={handPlayer.avatarURL} alt="avatar" />
          </div>
          <div>
            $<CountUp preserveValue={true} end={handPlayer.stack} duration={MONEY_EFFECT_DURATION} />
            <span style={{ fontSize: "1em" }}>
              {turnIndex !== positionIndex &&
                actionType &&
                actionType !== "blind" &&
                ` | ${actionType.toUpperCase()}`}
            </span>
          </div>
          <div
            className={
              "whitespace-nowrap truncate px-1" +
              (handPlayer.name.length > 12 ? " text-sm mt-1" : "")
            }
          >
            {handPlayer.name}
          </div>
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
