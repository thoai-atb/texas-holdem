import React from "react";
import { useGame } from "../contexts/Game";
import { indexFromPosition } from "../utilities/position_converter";

export function ActionBar() {
  const {
    takeAction,
    isPlaying,
    players,
    seatIndex,
    turnIndex,
    bets,
    currentBetSize,
  } = useGame();
  const positionIndex = indexFromPosition(0, seatIndex);
  if (!players || !players[positionIndex]) return null;
  const handPlayer = players[positionIndex];
  const myBet = bets[positionIndex];
  const toCall = currentBetSize - myBet;
  const disable = !isPlaying || seatIndex !== turnIndex;
  return (
    <div className="w-full flex items-center justify-center pointer-events-auto">
      {!isPlaying && !handPlayer.ready && (
        <ActionButton
          action={() => takeAction({ type: "ready" })}
          title="ready"
          className="bg-purple-500"
        />
      )}
      {isPlaying && (
        <>
          <ActionButton
            action={() => takeAction({ type: "fold" })}
            title="fold"
            disable={disable}
            className="bg-red-500"
          />
          {toCall > 0 && (
            <ActionButton
              action={() => takeAction({ type: "call" })}
              title="call"
              disable={disable}
              className="bg-lime-500"
            />
          )}
          {toCall === 0 && (
            <ActionButton
              action={() => takeAction({ type: "check" })}
              title="check"
              disable={disable}
              className="bg-lime-500"
            />
          )}
          {currentBetSize > 0 && (
            <ActionButton
              action={() => takeAction({ type: "raise" })}
              title="raise"
              disable={disable}
              className="bg-cyan-500"
            />
          )}
          {currentBetSize === 0 && (
            <ActionButton
              action={() => takeAction({ type: "bet" })}
              title="bet"
              disable={disable}
              className="bg-cyan-500"
            />
          )}
        </>
      )}
    </div>
  );
}

export const ActionButton = ({ action, title, className, disable }) => {
  return (
    <button
      className={
        className +
        " text-white p-4 rounded-full uppercase m-8 text-4xl w-64 text-center" +
        (disable ? " opacity-50" : " active:brightness-50 cursor-pointer")
      }
      disabled={disable}
      onClick={action}
    >
      {title}
    </button>
  );
};
