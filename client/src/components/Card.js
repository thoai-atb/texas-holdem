import React from "react";
import { useGame } from "../contexts/Game";

export function Card({ card }) {
  const { inspection } = useGame();
  const isInspected =
    inspection &&
    inspection.cards?.some(
      (c) => c.suit === card.suit && c.value === card.value
    );
  card = card || { value: "A", suit: "♣" };
  return (
    <div
      className={
        "bg-white transition duration-500 w-16 h-24 m-1 flex justify-center items-center select-none rounded-lg relative" +
        (["♥", "♦"].includes(card.suit) ? " text-red-600" : "") +
        (inspection
          ? isInspected
            ? " -translate-y-6"
            : " "
          : " ")
      }
    >
      <div className="absolute top-0 left-0">
        <div className="text-3xl h-6 font-bold">{card.value}</div>
        <div className="text-3xl h-6">{card.suit}</div>
      </div>
      <div className="absolute bottom-0 right-0 clear-both">
        <div className="text-6xl">{card.suit}</div>
      </div>
    </div>
  );
}
