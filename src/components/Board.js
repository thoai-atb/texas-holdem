import React from "react";
import { useGame } from "../contexts/Game";
import { Card } from "./Card";

export function Board() {
  const { board, inspection } = useGame();
  if (!board) return null;
  return (
    <div className="relative clear-both">
      <div className="bg-gray-500 border-2 rounded-lg flex flex-row">
        {board.map((card, index) => (
          <Card card={card} key={index} />
        ))}
      </div>
      <div className="absolute w-full flex justify-center bg-stone-900 rounded-md">
        {inspection && (
          <div className="text-4xl text-center text-white clear-both">
            {inspection.type.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
