import { useGame } from "../../contexts/Game";

export function DebugPanel() {
  const { showDown, isPlaying, seatIndex, turnIndex, buttonIndex, debugMode } =
    useGame();

  if (!debugMode) return null;

  return (
    <div
      className="text-xl absolute text-white bg-black bg-opacity-20 p-4 left-4 pointer-events-auto rounded group animate-fade-in-up"
      style={{ width: "16rem" }}
    >
      <div className="text-left font-bold">Game State</div>
      <DebugAttribute name="showDown" value={showDown} />
      <DebugAttribute name="isPlaying" value={isPlaying} />
      <DebugAttribute name="seatIndex" value={seatIndex} />
      <DebugAttribute name="turnIndex" value={turnIndex} />
      <DebugAttribute name="buttonIndex" value={buttonIndex} />
    </div>
  );
}

const DebugAttribute = ({ name, value }) => {
  var color = "text-cyan-300";
  if (value === true) {
    color = "text-lime-300";
  } else if (value === false) {
    color = "text-red-500";
  }
  return (
    <div className="flex gap-4">
      <div className="text-white w-28 text-left">{name}:</div>{" "}
      <div className={color}>{value.toString()}</div>
    </div>
  );
};
