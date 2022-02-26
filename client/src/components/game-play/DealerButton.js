import React from "react";
import { useGame } from "../../contexts/Game";
import { positionFromIndex } from "../../utilities/position_converter";

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
      style = { top: "80%", left: "57%" };
      break;
    case 1:
      style = { top: "82%", left: "32%" };
      break;
    case 2:
      style = { top: "78%", left: "12%" };
      break;
    case 3:
      style = { top: "19%", left: "12%" };
      break;
    case 4:
      style = { top: "9%", left: "32%" };
      break;
    case 5:
      style = { top: "9%", left: "64%" };
      break;
    case 6:
      style = { top: "19%", left: "85%" };
      break;
    case 7:
      style = { top: "82%", left: "85%" };
      break;
    case 8:
      style = { top: "82%", left: "65%" };
      break;
    default:
      break;
  }
  return (
    <div className="absolute w-full h-full pointer-events-none">
      <div
        className="absolute w-0 h-0 flex overflow-visible duration-500"
        style={style}
      >
        <div className="absolute bg-white rounded-full w-9 h-9 flex items-center justify-center font-bold border border-black">
          {/* {buttonIndex} */}D
        </div>
      </div>
    </div>
  );
}
