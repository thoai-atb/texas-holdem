import React, { useEffect, useState } from "react";
import { useGame } from "../../contexts/Game";

export function PlayerRank({ player }) {
  const { players, bets, showDown, isPlaying } = useGame();
  const [handRank, setHandRank] = useState(0);
  useEffect(() => {
    if (isPlaying && showDown) {
      // don't show ranking if we're showing down
      setHandRank(0);
      return;
    }
    const sorted = players
      .map((p) => {
        if (!p) return null;
        return p.stack + bets[p.seatIndex];
      })
      .filter((v) => v)
      .sort((a, b) => b - a);
    const currentPoint = player.stack + bets[player.seatIndex];
    const idx = sorted.indexOf(currentPoint);
    const lastIdx = sorted.lastIndexOf(currentPoint);
    if (lastIdx > 2) setHandRank(0);
    else if (idx === 0 && lastIdx === sorted.length - 1)
      setHandRank(0); // don't show ranking if all player are 1st
    else setHandRank(idx + 1);
  }, [player, players, bets, showDown, isPlaying]);

  var rankTh = "th";
  if (handRank === 0) return null;
  if (handRank === 1) rankTh = "st";
  else if (handRank === 2) rankTh = "nd";
  else if (handRank === 3) rankTh = "rd";
  return (
    <div
      className={
        "absolute rotate-6 text-3xl right-full top-full -translate-y-16 translate-x-1 rounded-full w-12 h-12 font-bold" +
        (handRank === 1 ? " text-yellow-300" : "") +
        (handRank === 2 ? " text-gray-300" : "") +
        (handRank === 3 ? " text-yellow-600" : "")
      }
      style={{ textShadow: "0.1rem 0.1rem 0.2rem black" }}
    >
      {handRank}
      <span className="text-sm absolute translate-y-3 -translate-x-0.5">
        {rankTh}
      </span>
    </div>
  );
}
