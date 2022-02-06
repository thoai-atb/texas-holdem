import React from "react";
import { Bets } from "./Bets";
import { Board } from "./Board";
import { DealerButton } from "./DealerButton";
import { Hand } from "./Hand";

export function Table() {
  return (
    <div className="relative bg-gray-400 border-8 border-slate-700 rounded-full w-2/3 h-3/5 flex items-center justify-center">
      <Board />
      <DealerButton />
      <Bets />
      <Hand style={{ bottom: "-5%", left: "50%", position: "absolute" }} position={0}/>
      <Hand style={{ bottom: "0%", left: "25%", position: "absolute" }} position={1}/>
      <Hand style={{ bottom: "20%", left: "5%", position: "absolute" }} position={2}/>
      <Hand style={{ top: "20%", left: "5%", position: "absolute" }} position={3}/>
      <Hand style={{ top: "-5%", left: "25%", position: "absolute" }} position={4}/>
      <Hand style={{ top: "-5%", left: "75%", position: "absolute" }} position={5}/>
      <Hand style={{ top: "20%", right: "5%", position: "absolute" }} position={6}/>
      <Hand style={{ bottom: "20%", right: "5%", position: "absolute" }} position={7}/>
      <Hand style={{ bottom: "0%", left: "75%", position: "absolute" }} position={8}/>
    </div>
  );
}
