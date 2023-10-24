import React, { useContext } from "react";
import { AppContext, useAppContext } from "../../App";

export function GameRule({ hidden, setHidden }) {
  const { darkMode } = useContext(AppContext);
  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className={
          "w-96 bg-opacity-95 z-10 rounded-2xl absolute top-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up " +
          (darkMode ? " bg-black text-white" : " bg-white text-slate-700")
        }
        style={{ width: "30rem" }}
      >
        <div className="text-xl font-bold text-center pb-4">Game Rule</div>
        <div
          className="overflow-x-hidden overflow-y-scroll hide-scrollbar"
          style={{ maxHeight: "40rem" }}
        >
          <div className="text-lg">
            The objective of this game is to win chips or money by either having
            the best hand at showdown or convincing your opponents to fold their
            hands.
          </div>
          <div className="text-lg mt-5">
            A standard 52-card deck is used, with the Ace as the highest-ranking
            card and the 2 as the lowest.
          </div>
          <div className="mt-6 text-base font-bold text-center">
            Hand Rankings
          </div>
          <HandRank title="Royal Flush" rank={1} />
          <HandRankIllustrator
            hand={[
              ["A", "♦"],
              ["K", "♦"],
              ["Q", "♦"],
              ["J", "♦"],
              ["10", "♦"],
            ]}
          />
          <HandRank title="Straight Flush" rank={2} />
          <HandRankIllustrator
            hand={[
              ["8", "♠"],
              ["7", "♠"],
              ["6", "♠"],
              ["5", "♠"],
              ["4", "♠"],
            ]}
          />
          <HandRank title="Four of a Kind" rank={3} />
          <HandRankIllustrator
            hand={[
              ["10", "♣"],
              ["10", "♦"],
              ["10", "♠"],
              ["10", "♥"],
              ["3", "♣"],
            ]}
          />
          <HandRank title="Full House" rank={4} />
          <HandRankIllustrator
            hand={[
              ["9", "♣"],
              ["9", "♦"],
              ["9", "♠"],
              ["7", "♥"],
              ["7", "♠"],
            ]}
          />
          <HandRank title="Flush" rank={5} />
          <HandRankIllustrator
            hand={[
              ["A", "♥"],
              ["K", "♥"],
              ["10", "♥"],
              ["8", "♥"],
              ["6", "♥"],
            ]}
          />
          <HandRank title="Straight" rank={6} />
          <HandRankIllustrator
            hand={[
              ["6", "♠"],
              ["5", "♣"],
              ["4", "♦"],
              ["3", "♥"],
              ["2", "♠"],
            ]}
          />
          <HandRank title="Three of a Kind" rank={7} />
          <HandRankIllustrator
            hand={[
              ["Q", "♦"],
              ["Q", "♠"],
              ["Q", "♣"],
              ["9", "♠"],
              ["7", "♦"],
            ]}
          />
          <HandRank title="Two Pair" rank={8} />
          <HandRankIllustrator
            hand={[
              ["K", "♠"],
              ["K", "♦"],
              ["7", "♠"],
              ["7", "♣"],
              ["3", "♠"],
            ]}
          />
          <HandRank title="Pair" rank={9} />
          <HandRankIllustrator
            hand={[
              ["J", "♦"],
              ["J", "♠"],
              ["A", "♣"],
              ["8", "♠"],
              ["5", "♦"],
            ]}
          />
          <HandRank title="High Card" rank={10} />
          <HandRankIllustrator
            hand={[
              ["A", "♠"],
              ["K", "♦"],
              ["Q", "♣"],
              ["9", "♠"],
              ["7", "♥"],
            ]}
          />
        </div>
      </div>
    </>
  );
}

function HandRank({ title, rank }) {
  const { darkMode } = useAppContext();
  return (
    <div className="mt-6 text-base font-bold">
      <div
        className={
          "p-4 rounded-full w-10 h-10 mr-4 inline-flex items-center justify-center" +
          (darkMode ? " bg-cyan-500" : " bg-cyan-200")
        }
      >
        {rank}
      </div>
      {title}
    </div>
  );
}

function HandRankIllustrator({ hand }) {
  return (
    <div className="w-full justify-around flex gap-2 my-4">
      {hand.map((card) => (
        <CardImage card={{ value: card[0], suit: card[1] }} />
      ))}
    </div>
  );
}

function CardImage({ card }) {
  return (
    <div
      className={
        "bg-white border border-black w-16 h-24 m-0.5 flex justify-center items-center select-none rounded-lg relative"
      }
    >
      <div
        className={
          ["♥", "♦"].includes(card.suit) ? " text-red-600" : " text-black"
        }
      >
        <div className="absolute top-0.5 left-1">
          <div className="text-3xl h-6 font-bold font-playing-card">
            {card.value}
          </div>
          <div className="text-3xl h-6 mt-0.5">{card.suit}</div>
        </div>
        <div className="absolute bottom-0 right-0 clear-both">
          <div className="text-6xl">{card.suit}</div>
        </div>
      </div>
    </div>
  );
}
