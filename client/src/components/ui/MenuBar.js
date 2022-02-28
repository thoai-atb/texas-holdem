import React from "react";
import { AiOutlineLogout, AiFillWechat, AiOutlineInfoCircle } from "react-icons/ai";
import { BsFillVolumeMuteFill, BsFillVolumeUpFill } from "react-icons/bs";
import { useGame } from "../../contexts/Game";
import { useSoundContext } from "../../contexts/Sound";
import { VolumeOption } from "./VolumeOption";

export default function MenuBar({ toggleChat, toggleMuted, toggleInfo, isMuted }) {
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
  const infoClickHandler = () => {
    toggleInfo();
    playBubbleClick();
  };
  return (
    <div className="absolute overflow-visible top-0 w-full text-slate-700 text-5xl pointer-events-auto flex flex-row items-center justify-between">
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
        title="Info"
        onClick={infoClickHandler}
      >
        <AiOutlineInfoCircle />
      </div>
      <div
        className="relative p-4 w-fit hover:text-white cursor-pointer transition duration-100 overflow-visible group"
        title={isMuted ? "Unmute" : "Mute"}
        onClick={toggleMutedHandler}
      >
        {isMuted && <BsFillVolumeMuteFill />}
        {!isMuted && <BsFillVolumeUpFill />}
        {<VolumeOption />}
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
