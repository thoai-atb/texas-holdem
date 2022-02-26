import React from "react";
import { AiOutlineLogout, AiFillWechat } from "react-icons/ai";
import { BsFillVolumeMuteFill, BsFillVolumeUpFill } from "react-icons/bs";
import { useGame } from "../contexts/Game";
import { useSoundContext } from "../contexts/Sound";

export default function MenuBar({ toggleChat, toggleMuted, isMuted }) {
  const { socket } = useGame();
  const { playBubbleClick } = useSoundContext();
  const logOutHandler = () => {
    playBubbleClick();
    socket.disconnect();
  };
  const chatClickHandler = () => {
    playBubbleClick();
    toggleChat();
  };
  const toggleMutedHandler = () => {
    playBubbleClick();
    toggleMuted();
  };
  return (
    <div className="absolute top-0 w-full text-slate-700 text-6xl pointer-events-auto flex flex-row items-center justify-between overflow-hidden">
      <div
        className="rotate-180 p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Log Out"
        onClick={logOutHandler}
      >
        <AiOutlineLogout />
      </div>
      <div className="flex-1"></div>
      <div
        className="p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title={isMuted ? "Unmute" : "Mute"}
        onClick={toggleMutedHandler}
      >
        {isMuted && <BsFillVolumeMuteFill />}
        {!isMuted && <BsFillVolumeUpFill />}
      </div>
      <div
        className="p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Chat"
        onClick={chatClickHandler}
      >
        <AiFillWechat />
      </div>
    </div>
  );
}
