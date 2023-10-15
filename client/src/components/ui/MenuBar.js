import React, { useContext } from "react";
import {
  AiFillSetting,
  AiFillWechat,
  AiOutlineInfoCircle,
  AiOutlineInsertRowBelow,
  AiOutlineLogout,
  AiOutlineAlignLeft,
} from "react-icons/ai";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";

export default function MenuBar({
  toggleChat,
  toggleInfo,
  toggleControlPanel,
  toggleStatistics,
}) {
  const { playBubbleClick } = useSoundContext();
  const { setShowSettings, setShowLogout, darkMode } = useContext(AppContext);
  function handleAction(actionFunc) {
    return () => {
      playBubbleClick();
      actionFunc();
    };
  }
  const buttonClassName = darkMode
    ? "text-cyan-500 hover:text-slate-700 cursor-pointer transition duration-100"
    : "text-slate-700 hover:text-white cursor-pointer transition duration-100";
  return (
    <div className="absolute overflow-visible top-0 w-full text-slate-700 text-4xl pointer-events-auto flex flex-row items-center justify-between">
      <div
        className={"rotate-180 p-4 w-fit " + buttonClassName}
        title="Log Out"
        onClick={handleAction(() => setShowLogout((s) => !s))}
      >
        <AiOutlineLogout />
      </div>
      <div className="flex-1"></div>
      <div
        className={"p-4 w-fit " + buttonClassName}
        title="Info"
        onClick={handleAction(toggleInfo)}
      >
        <AiOutlineInfoCircle />
      </div>
      <div
        className={"p-4 w-fit " + buttonClassName}
        title="Statistics"
        onClick={handleAction(toggleStatistics)}
      >
        <AiOutlineAlignLeft />
      </div>
      <div
        className={"p-4 w-fit " + buttonClassName}
        title="Control panel"
        onClick={handleAction(toggleControlPanel)}
      >
        <AiOutlineInsertRowBelow />
      </div>
      <div
        className={"p-4 w-fit " + buttonClassName}
        title="Settings"
        onClick={handleAction(() => setShowSettings((s) => !s))}
      >
        <AiFillSetting />
      </div>
      <div
        className={"p-4 w-fit " + buttonClassName}
        title="Chat"
        onClick={handleAction(toggleChat)}
      >
        <AiFillWechat />
      </div>
    </div>
  );
}
