import React, { useContext } from "react";
import { useGame } from "../../contexts/Game";
import { Bets } from "./Bets";
import { Board } from "./Board";
import { DealerButton } from "./DealerButton";
import { Hand } from "./Hand";
import dotPattern from "../../assets/texture/dot-pattern.png";
import { AppContext } from "../../App";
import { monetary } from "../../utilities/number";

export function Table() {
  const { bigblindSize } = useGame();
  const { darkMode } = useContext(AppContext);
  return (
    <div
      className={
        "relative bg-rad rounded-full w-3/4 h-1/2 flex items-center justify-center" +
        (darkMode ? " border-black" : " border-green-900")
      }
      style={{
        maxHeight: "30rem",
        borderWidth: "0.5rem",
        backgroundImage: darkMode
          ? "radial-gradient(cyan, navy)"
          : "radial-gradient(lime, green)",
        boxShadow: "0rem 2rem rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="absolute rounded-full w-full h-full opacity-5 overflow-hidden "
        style={{
          backgroundImage: `url(${dotPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
      <div
        className="absolute top-0 w-72 h-28 rounded-b-xl bg-gray-300 opacity-50"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="w-full text-center text-slate-700">
          BLIND LEVEL: {monetary(bigblindSize / 2)} / {monetary(bigblindSize)}
        </div>
      </div>
      <Board />
      <DealerButton />
      {/* <DealerButton debugPosition={0}/>
      <DealerButton debugPosition={1}/>
      <DealerButton debugPosition={2}/>
      <DealerButton debugPosition={3}/>
      <DealerButton debugPosition={4}/>
      <DealerButton debugPosition={5}/>
      <DealerButton debugPosition={6}/>
      <DealerButton debugPosition={7}/>
      <DealerButton debugPosition={8}/> */}
      <Bets />
      {/* Hands should be in order: 4 5 3 6 2 7 1 8 0 - because hands on the bottom can't be displayed over by hands on top*/}
      <Hand
        style={{ top: "-2%", left: "25%", position: "absolute" }}
        position={4}
      />
      <Hand
        style={{ top: "-2%", left: "75%", position: "absolute" }}
        position={5}
      />
      <Hand
        style={{ top: "20%", left: "5%", position: "absolute" }}
        position={3}
      />
      <Hand
        style={{ top: "20%", right: "5%", position: "absolute" }}
        position={6}
      />
      <Hand
        style={{ bottom: "20%", left: "5%", position: "absolute" }}
        position={2}
      />
      <Hand
        style={{ bottom: "20%", right: "5%", position: "absolute" }}
        position={7}
      />
      <Hand
        style={{ bottom: "0%", left: "25%", position: "absolute" }}
        position={1}
      />
      <Hand
        style={{ bottom: "0%", left: "75%", position: "absolute" }}
        position={8}
      />
      <Hand
        style={{ bottom: "-10%", left: "50%", position: "absolute" }}
        position={0}
      />
    </div>
  );
}
