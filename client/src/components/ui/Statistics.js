import { useEffect, useState } from "react";
import { useGame } from "../../contexts/Game";
import { calculateStatistics } from "../../utilities/statistics";

export function Statistics({ hidden, setHidden }) {
  const { seatIndex, board, players } = useGame();
  const [statistics, setStatistics] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const cards = players[seatIndex]?.cards;
  const notEnoughInfo = board.length <= 0 || !cards || cards.length <= 0;
  useEffect(() => {
    if (notEnoughInfo) setStatistics([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    else setStatistics(calculateStatistics(board, cards));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board.length]);
  if (hidden) return null;
  return (
    <div className="absolute text-white bottom-10 bg-black bg-opacity-20 p-4 left-4 pointer-events-auto rounded group animate-fade-in-up">
      <div
        className="absolute bottom-full right-0 hidden group-hover:flex justify-end text-sm pb-4 pl-16 hover:text-cyan-500 cursor-pointer"
        onClick={() => setHidden(true)}
      >
        Close [R]
      </div>
      {notEnoughInfo && "Hand ranks calculator"}
      <SortedRanks statistics={statistics} />
    </div>
  );
}

function SortedRanks({ statistics }) {
  const ranks = [
    {
      text: "Straight Flush",
      chance: statistics[0],
    },
    {
      text: "Four Of A Kind",
      chance: statistics[1],
    },
    {
      text: "Full House",
      chance: statistics[2],
    },
    {
      text: "Flush",
      chance: statistics[3],
    },
    {
      text: "Straight",
      chance: statistics[4],
    },
    {
      text: "Three Of A Kind",
      chance: statistics[5],
    },
    {
      text: "Two Pair",
      chance: statistics[6],
    },
    {
      text: "Pair",
      chance: statistics[7],
    },
    {
      text: "High Card",
      chance: statistics[8],
    },
  ];
  ranks.sort((a, b) => b.chance - a.chance);
  return (
    <>
      {ranks.map((rank) => (
        <Rank text={rank.text} chance={rank.chance} key={rank.text} />
      ))}
    </>
  );
}

function Rank({ text, chance = 0 }) {
  const percentage = Math.round(chance * 100);
  if (percentage === 0) return null;
  return (
    <div className="text-xl mb-2">
      <div className="mb-1">
        {text} {percentage}%
      </div>
      <div className="relative bg-white w-48 h-1 rounded-full">
        <div
          className="bg-cyan-300 h-full transition-all duration-500"
          style={{ width: percentage + "%" }}
        />
      </div>
    </div>
  );
}
