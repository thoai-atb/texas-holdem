import React from "react";
import { useGame } from "../../contexts/Game";
import { Bets } from "./Bets";
import { Board } from "./Board";
import { DealerButton } from "./DealerButton";
import { Hand } from "./Hand";

export function Table() {
  const { bigblindSize } = useGame();
  return (
    <div
      className="relative bg-gray-400 border-slate-700 rounded-full w-2/3 h-1/2 flex items-center justify-center"
      style={{
        maxHeight: "30rem",
        borderWidth: "0.5rem",
      }}
    >
      <div className="absolute top-0 w-72 h-28 rounded-b-xl bg-gray-300">
        <div className="w-full text-center text-slate-700">
          BLIND LEVEL: {bigblindSize / 2}/{bigblindSize}
        </div>
      </div>
      <Board />
      <DealerButton />
      <Bets />
      <Hand
        style={{ bottom: "-10%", left: "50%", position: "absolute" }}
        position={0}
      />
      <Hand
        style={{ bottom: "0%", left: "25%", position: "absolute" }}
        position={1}
      />
      <Hand
        style={{ bottom: "20%", left: "5%", position: "absolute" }}
        position={2}
      />
      <Hand
        style={{ top: "20%", left: "5%", position: "absolute" }}
        position={3}
      />
      <Hand
        style={{ top: "-2%", left: "25%", position: "absolute" }}
        position={4}
      />
      <Hand
        style={{ top: "-2%", left: "75%", position: "absolute" }}
        position={5}
      />
      <Hand
        style={{ top: "20%", right: "5%", position: "absolute" }}
        position={6}
      />
      <Hand
        style={{ bottom: "20%", right: "5%", position: "absolute" }}
        position={7}
      />
      <Hand
        style={{ bottom: "0%", left: "75%", position: "absolute" }}
        position={8}
      />
    </div>
  );
}
