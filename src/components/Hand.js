import React from "react";
import { Card } from "./Card";
import { useGame } from "../contexts/Game";

export function Hand({ style, position }) {
  const game = useGame();
  const { players, inspect, inspection } = game;
  if (!players || !players[position]) return null;
  const onClick = () => {
    inspect(position);
  };
  return (
    <div
      className="w-0 h-0 flex justify-center items-center cursor-pointer"
      style={style}
      onClick={onClick}
    >
      <div
        className={
          "flex flex-row rounded-lg border-gray-600 bg-orange-200" +
          (inspection
            ? inspection.position === position
              ? " border-2"
              : " opacity-50"
            : "")
        }
      >
        {players[position].cards.map((card, index) => (
          <Card key={index} card={card} />
        ))}
      </div>
    </div>
  );
}
