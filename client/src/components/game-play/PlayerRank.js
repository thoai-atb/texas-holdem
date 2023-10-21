import React, { useEffect, useState } from "react";
import { useGame } from "../../contexts/Game";

export function PlayerRank({ player }) {
  const { playersRanking } = useGame();
  const [handRank, setHandRank] = useState(0);
  useEffect(() => {
    if (player.newToTable) setHandRank(-1);
    else setHandRank(playersRanking[player.seatIndex]);
  }, [player.seatIndex, player.newToTable, playersRanking]);

  var rankTh = "";
  if (handRank === 0) return null;
  if (handRank === 1) rankTh = "st";
  else if (handRank === 2) rankTh = "nd";
  else if (handRank === 3) rankTh = "rd";
  return (
    handRank > 0 && (
      <div
        className={
          "absolute rotate-6 -translate-y-16 text-3xl right-full top-full translate-x-1 rounded-full w-12 h-12 font-bold" +
          (handRank === 1 ? " text-yellow-300" : "") +
          (handRank === 2 ? " text-gray-300" : "") +
          (handRank === 3 ? " text-yellow-600" : "")
        }
        style={{ textShadow: "0.1rem 0.1rem 0.2rem black" }}
      >
        {handRank > 0 && handRank}
        <span className="text-sm absolute translate-y-3 -translate-x-0.5">
          {rankTh}
        </span>
      </div>
    )
  );
}
