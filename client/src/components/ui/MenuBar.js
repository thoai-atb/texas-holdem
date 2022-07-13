import React, { useContext } from "react";
import {
  AiFillSetting,
  AiFillWechat,
  AiOutlineInfoCircle,
  AiOutlineInsertRowBelow,
  AiOutlineLogout
} from "react-icons/ai";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";

export default function MenuBar({
  toggleChat,
  toggleInfo,
  toggleControlPanel,
}) {
  const { playBubbleClick } = useSoundContext();
  const { setShowSettings, setShowLogout } = useContext(AppContext);
  function handleAction(actionFun) {
    return () => {
      playBubbleClick();
      actionFun();
    };
  }
  return (
    <div className="absolute overflow-visible top-0 w-full text-slate-700 text-4xl pointer-events-auto flex flex-row items-center justify-between">
      <div
        className="rotate-180 p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Log Out"
        onClick={handleAction(() => setShowLogout((s) => !s))}
      >
        <AiOutlineLogout />
      </div>
      <div className="flex-1"></div>
      <div
        className="p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Info"
        onClick={handleAction(toggleInfo)}
      >
        <AiOutlineInfoCircle />
      </div>
      <div
        className="p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Control panel"
        onClick={handleAction(toggleControlPanel)}
      >
        <AiOutlineInsertRowBelow />
      </div>
      <div
        className={
          "p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        }
        title="Settings"
        onClick={handleAction(() => setShowSettings((s) => !s))}
      >
        <AiFillSetting />
      </div>
      <div
        className="p-4 w-fit hover:text-white cursor-pointer transition duration-100"
        title="Chat"
        onClick={handleAction(toggleChat)}
      >
        <AiFillWechat />
      </div>
    </div>
  );
}
