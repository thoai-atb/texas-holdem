import React from "react";
import { useGame } from "../contexts/Game";
import { positionFromIndex } from "../utilities/position_converter";

export function DealerButton({ debugPosition = -1 }) {
  const { buttonIndex, seatIndex } = useGame();
  if (buttonIndex < 0) return null;
  let position =
    debugPosition < 0
      ? positionFromIndex(buttonIndex, seatIndex)
      : debugPosition;
  let style;
  switch (position) {
    case 0:
      style = { bottom: "9%", left: "57%" };
      break;
    case 1:
      style = { bottom: "8%", left: "32%" };
      break;
    case 2:
      style = { bottom: "19%", left: "13%" };
      break;
    case 3:
      style = { top: "19%", left: "13%" };
      break;
    case 4:
      style = { top: "9%", left: "32%" };
      break;
    case 5:
      style = { top: "9%", right: "32%" };
      break;
    case 6:
      style = { top: "19%", right: "13%" };
      break;
    case 7:
      style = { bottom: "19%", right: "13%" };
      break;
    case 8:
      style = { bottom: "8%", right: "32%" };
      break;
    default:
      break;
  }
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <div
        className="absolute bg-white rounded-full w-9 h-9 flex items-center justify-center font-bold border border-black"
        style={style}
      >
        {/* {buttonIndex} */}D
      </div>
    </div>
  );
}
