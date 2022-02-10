import React from "react";
import { useGame } from "../contexts/Game";

export function Card({ card, hidden }) {
  const { winners } = useGame();
  const hands = winners.map((winner) => winner.cards);
  const showDown = winners.length > 0;
  const highLight =
    card &&
    hands.some((hand) =>
      hand.some((c) => c.suit === card.suit && c.value === card.value)
    );
  return (
    <div
      className={
        "transition duration-500 w-16 h-24 m-0.5 flex justify-center items-center select-none rounded-lg relative" +
        (showDown ? (highLight ? " -translate-y-5" : " ") : " ") +
        (card ? " bg-white" : " bg-transparent")
      }
    >
      {card && !hidden && (
        <div className={["♥", "♦"].includes(card.suit) ? " text-red-600" : ""}>
          <div className="absolute top-0 left-0">
            <div className="text-3xl h-6 font-bold">{card.value}</div>
            <div className="text-3xl h-6">{card.suit}</div>
          </div>
          <div className="absolute bottom-0 right-0 clear-both">
            <div className="text-6xl">{card.suit}</div>
          </div>
        </div>
      )}
      {hidden && (
        <div className="w-5/6 h-5/6 rounded-lg bg-gradient-to-r from-gray-200 to-rose-400"></div>
      )}
    </div>
  );
}
