import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../App";
import { useGame } from "../../contexts/Game";
import { PanelButton } from "./PanelButton";

var DEFAULT_AMOUNT = 1000;

export function Donation({ hidden, setHidden }) {
  const { darkMode, socket, donationSelection, appAction, setAppAction } =
    useContext(AppContext);
  const { players, seatIndex, isPlaying } = useGame();
  const inputRef = React.useRef();
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [targetName, setTargetName] = useState("");

  const playerStack = useMemo(
    () => players[seatIndex]?.stack,
    [players, seatIndex]
  );

  const donate = () => {
    setHidden(true);
    if (amount === 0) return;
    socket.emit("player_action", {
      type: "donate",
      target: targetName,
      amount: amount,
    });
  };

  useEffect(() => {
    if (isPlaying) setHidden(true);
  });

  useEffect(() => {
    if (appAction === "enter_pressed" && !hidden) {
      setAppAction("");
      donate();
    }
  });

  useEffect(() => {
    if(hidden) return;
    var processedAmount = parseInt(amount);
    if (isNaN(processedAmount)) processedAmount = 0;
    setAmount(Math.max(0, Math.min(playerStack, processedAmount)));
  }, [amount, hidden, playerStack]);

  useEffect(() => {
    if (!hidden) {
      setTargetName(players[donationSelection]?.name);
    }
  }, [donationSelection, hidden, players]);

  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className={
          "bg-opacity-80 z-10 rounded-2xl px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up " +
          (darkMode ? " bg-black text-white" : " bg-black text-white")
        }
        style={{ width: "20rem" }}
      >
        <div className={"text-xl mb-4 font-bold text-center text-green-300"}>
          Donate to {targetName}
        </div>
        <div className="w-full py-4 flex flex-row justify-center items-center gap-4">
          <div className="text-xl">Amount</div>
          <input
            className={
              "w-32 rounded-full text-xl font-bold p-2 text-center outline-none" +
              (darkMode ? " bg-black text-white" : " bg-black text-white")
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                donate();
              }
            }}
            onBlur={(e) => setAmount(e.target.value)}
            onChange={(e) => setAmount(e.target.value)}
            ref={inputRef}
            value={amount}
          ></input>
        </div>
        <div className="w-full flex flex-row justify-around items-center gap-4 ">
          <PanelButton text="Cancel" onClick={() => setHidden(true)} />
          <PanelButton text="Donate" onClick={() => donate()} />
        </div>
      </div>
    </>
  );
}
