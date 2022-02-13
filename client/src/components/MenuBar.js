import React from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useGame } from "../contexts/Game";

export default function MenuBar() {
  const { socket } = useGame();
  const clickHandler = () => {
    socket.disconnect();
  };
  return (
    <div className="absolute top-0 w-full h-32 text-slate-700 text-6xl pointer-events-auto">
      <div
        className="rotate-180 p-4 w-fit hover:text-white cursor-pointer hover:scale-110 transition duration-200"
        title="Log Out"
        onClick={clickHandler}
      >
        <AiOutlineLogout />
      </div>
    </div>
  );
}
