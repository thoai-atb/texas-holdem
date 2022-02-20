import React from "react";
import { AiOutlineLogout, AiFillWechat } from "react-icons/ai";
import { useGame } from "../contexts/Game";

export default function MenuBar({ toggleChat }) {
  const { socket,  } = useGame();
  const logOutHandler = () => {
    socket.disconnect();
  };
  const chatClickHandler = () => {
    toggleChat();
  };

  return (
    <div className="absolute top-0 w-full text-slate-700 text-6xl pointer-events-auto flex flex-row items-center justify-between overflow-hidden">
      <div
        className="rotate-180 p-4 w-fit hover:text-white cursor-pointer hover:scale-110 transition duration-200"
        title="Log Out"
        onClick={logOutHandler}
      >
        <AiOutlineLogout />
      </div>
      <div className="p-4 w-fit hover:text-white cursor-pointer hover:scale-110 transition duration-200"
      title="Chat"
      onClick={chatClickHandler}>
        <AiFillWechat />
      </div>
    </div>
  );
}
