import React from "react";
import { useGame } from "../contexts/Game";
import { positionFromIndex } from "../utilities/position_converter";

export function DealerButton() {
  const { buttonIndex, seatIndex } = useGame();
  if (buttonIndex < 0) return null;
  let style;
  switch (positionFromIndex(buttonIndex, seatIndex)) {
    case 0:
      style = { bottom: "10%", left: "59%" };
      break;
    case 1:
      style = { bottom: "10%", left: "32%" };
      break;
    case 2:
      style = { bottom: "25%", left: "13%" };
      break;
    case 3:
      style = { top: "22%", left: "13%" };
      break;
    case 4:
      style = { top: "21%", left: "28%" };
      break;
    case 5:
      style = { top: "21%", right: "28%" };
      break;
    case 6:
      style = { top: "22%", right: "13%" };
      break;
    case 7:
      style = { bottom: "21%", right: "13%" };
      break;
    case 8:
      style = { bottom: "10%", right: "32%" };
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
        {/* {buttonIndex} */}
        D
      </div>
    </div>
  );
}
