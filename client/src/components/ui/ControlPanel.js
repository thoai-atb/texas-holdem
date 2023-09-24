import React, { useEffect, useRef, useState } from "react";
import { useGame } from "../../contexts/Game";
import { useSoundContext } from "../../contexts/Sound";
import { AiFillLock } from "react-icons/ai";

export function ControlPanel({ hidden, setHidden }) {
  const { socket } = useGame();
  const { playBubbleClick, playStickClick } = useSoundContext();
  const [unlocked, setUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const unlockField = useRef(null);
  const sendCommand = (command) => {
    if (!command) return;
    playBubbleClick();
    socket.emit("chat_message", command);
    setHidden(true);
  };
  function handleUnlock(e) {
    if (e.key === "Enter") {
      unlock();
    }
  }
  function unlock() {
    const code = unlockField.current.value;
    unlockField.current.value = "";
    if (code.toUpperCase() === "FLUSH") {
      playBubbleClick();
      setUnlocked(true);
    } else {
      playStickClick();
      setErrorMessage("Wrong code! Please try again.");
    }
  }

  useEffect(() => {
    setErrorMessage("");
  }, [hidden]);

  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="bg-black bg-opacity-80 text-white z-10 rounded-2xl absolute top-20 right-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "20rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">Control Panel</div>
        <hr></hr>
        {unlocked && (
          <div className="w-full">
            <PanelButton
              text="Add bot"
              onClick={() => sendCommand("/add_bot")}
            />
            <PanelButton
              text="Fill bots"
              onClick={() => sendCommand("/fill_bots")}
            />
            <PanelButton
              text="Reset blinds"
              onClick={() => sendCommand("/set_blind 10")}
            />
            <PanelButton
              text="I'm broke!"
              onClick={() => sendCommand(`/please_support`)}
            />
          </div>
        )}
        {!unlocked && (
          <div className="w-full flex items-center justify-center flex-col">
            <div className="w-full flex items-center my-4 justify-center gap-4">
              Unlock code
              <input
                type="text"
                maxLength={6}
                className="text-lg w-24 rounded h-8 text-black p-4 outline-none font-mono"
                onKeyDown={handleUnlock}
                ref={unlockField}
              />
              <AiFillLock
                className="inline text-3xl text-gray-500 cursor-pointer hover:text-white"
                onClick={unlock}
              />
            </div>
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
          </div>
        )}
      </div>
    </>
  );
}

function PanelButton({ text, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center rounded-full px-4 py-1 font-bold bg-slate-700 text-cyan-500 h-16 my-4 text-lg whitespace-nowrap hover:bg-slate-800 cursor-pointer active:scale-95"
    >
      {text}
    </div>
  );
}
