import { useGame } from "../../contexts/Game";

export function DebugPanel() {
  const {
    debugMode,
    showDown,
    isPlaying,
    seatIndex,
    turnIndex,
    buttonIndex,
    completeActionSeat,
    allPlayersAllIn,
  } = useGame();

  if (!debugMode) return null;

  return (
    <div
      className="text-xl font-mono absolute text-white bg-black bg-opacity-60 p-4 left-4 pointer-events-auto rounded group animate-fade-in-up"
      style={{ width: "18rem" }}
    >
      <div className="text-gray-300 w-full text-left font-bold">Game State</div>
      <DebugAttribute name="showDown" value={showDown} />
      <DebugAttribute name="isPlaying" value={isPlaying} />
      <DebugAttribute name="seatIndex" value={seatIndex} />
      <DebugAttribute name="turnIndex" value={turnIndex} />
      <DebugAttribute name="buttonIndex" value={buttonIndex} />
      <DebugAttribute name="completeActionSeat" value={completeActionSeat} />
      <DebugAttribute name="allPlayersAllIn" value={allPlayersAllIn} />
    </div>
  );
}

const DebugAttribute = ({ name, value }) => {
  var color = "text-cyan-300";
  if (value === true) {
    color = "text-lime-300";
  } else if (value === false) {
    color = "text-rose-400";
  }
  return (
    <div className="flex gap-4">
      <div className="text-white text-right">{name}:</div>{" "}
      <div className={color}>{value.toString()}</div>
    </div>
  );
};
