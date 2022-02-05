import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";

export function Hand({ style, position }) {
  const game = useGame();
  const { players, inspect, inspection } = game;
  if (!players || !players[position]) return null;
  const thisPlayer = players[position];
  const onClick = () => {
    inspect(position);
  };
  return (
    <div
      className="w-0 h-0 flex justify-center items-center cursor-pointer"
      style={style}
      onClick={onClick}
    >
      <div className="">
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
          {players[position].cards.map((card, index) => (
            <Card key={index} card={card} />
          ))}
        </div>
        <div className="bg-black text-center text-white text-xl">${thisPlayer.stack}</div>
      </div>
    </div>
  );
}
