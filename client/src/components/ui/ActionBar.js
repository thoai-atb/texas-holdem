import React, { useContext, useEffect } from "react";
import {
  AiFillUpCircle,
  AiOutlineMinusCircle,
  AiOutlinePlusCircle,
} from "react-icons/ai";
import { AppContext } from "../../App";
import { useGame } from "../../contexts/Game";
import { useSoundContext } from "../../contexts/Sound";

export function ActionBar() {
  const { autoCheckCall, autoCheckFold } = useContext(AppContext);
  const {
    takeAction,
    isPlaying,
    players,
    seatIndex,
    turnIndex,
    availableActions,
    showDown,
    bigblindSize,
  } = useGame();
  const [showSelectBetSize, setShowSelectBetSize] = React.useState(false);
  if (!players || !players[seatIndex]) return null;
  const thisPlayer = players[seatIndex];
  const disable = !isPlaying || seatIndex !== turnIndex;
  if (autoCheckCall || autoCheckFold) {
    return (
      <div className="w-full flex items-center justify-center pointer-events-auto">
        <div className="flex items-center justify-center tracking-widest text-2xl text-black opacity-50 m-8 p-4">
          - YOU ARE AFK ({autoCheckCall ? "CHECK/CALL" : "CHECK/FOLD"}) -
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex items-center justify-center pointer-events-auto">
      {!isPlaying && !thisPlayer.ready && thisPlayer.stack >= bigblindSize && (
        <Button
          action={() => takeAction({ type: "ready" })}
          title="ready"
          className="bg-purple-500"
        />
      )}
      {isPlaying &&
        !disable &&
        availableActions.map((action, index) => {
          let className;
          let displaySize;
          switch (action.type) {
            case "fold":
              className = "bg-red-500";
              break;
            case "check":
            case "call":
              className = "bg-lime-500";
              displaySize = action.size;
              break;
            case "bet":
              className = "bg-cyan-500";
              break;
            case "raise":
              className = "bg-cyan-500";
              break;
            default:
              break;
          }
          return (
            <ActionButton
              showSelectBetSize={showSelectBetSize}
              setShowSelectBetSize={setShowSelectBetSize}
              key={index}
              availableAction={action}
              takeAction={takeAction}
              title={action.type + (displaySize ? ` $${displaySize}` : "")}
              className={className}
            />
          );
        })}
      {isPlaying &&
        seatIndex !== turnIndex &&
        !thisPlayer.folded &&
        thisPlayer.cards?.length > 0 &&
        !showDown && (
          <div className="flex items-center justify-center tracking-widest text-2xl text-black opacity-50 m-8 p-4">
            - WAIT FOR YOUR TURN -
          </div>
        )}
    </div>
  );
}

export const Button = ({ action, title, className }) => {
  const { playBubbleClick } = useSoundContext();
  return (
    <button
      className={
        className +
        " text-white p-4 rounded-full uppercase m-8 text-4xl w-64 text-center"
      }
      onClick={() => {
        playBubbleClick();
        action();
      }}
    >
      {title}
    </button>
  );
};

export const ActionButton = ({
  title,
  takeAction,
  className,
  showSelectBetSize,
  setShowSelectBetSize,
  availableAction,
}) => {
  const { playBubbleClick, playStickClick } = useSoundContext();
  const inputRef = React.useRef();
  const [betSize, setBetSize] = React.useState(0);
  const { currentBetSize, bigblindSize, pot } = useGame();
  const isAggressive =
    availableAction.type === "raise" || availableAction.type === "bet";
  const expand = isAggressive && showSelectBetSize;

  const buttonClickHandler = () => {
    if (isAggressive) {
      if (!showSelectBetSize) {
        playBubbleClick();
        setShowSelectBetSize(true);
      }
    } else {
      playBubbleClick();
      takeAction({ type: availableAction.type });
    }
  };

  const confirm = (e) => {
    e.stopPropagation();
    const size = parseInt(betSize) - currentBetSize;
    if (size < availableAction.minSize || size > availableAction.maxSize) {
      alert("Invalid bet size");
      return;
    }
    setShowSelectBetSize(false);
    playStickClick();
    takeAction({ type: availableAction.type, size: size });
  };

  const minusButtonHandler = (e) => {
    e.stopPropagation();
    let newBetSize = betSize - bigblindSize;
    if (newBetSize - currentBetSize < availableAction.minSize) {
      newBetSize = availableAction.minSize + currentBetSize;
    }
    playStickClick();
    setBetSize(newBetSize);
  };

  const checkBetSize = (value) => {
    if (typeof value === "string") value = parseInt(value);
    if (!value) return;
    if (value < availableAction.minSize + currentBetSize) {
      value = availableAction.minSize + currentBetSize;
    } else if (value > availableAction.maxSize + currentBetSize) {
      value = availableAction.maxSize + currentBetSize;
    }
    playStickClick();
    setBetSize(value);
  };

  const plusButtonHandler = (e) => {
    e.stopPropagation();
    var newBetSize = betSize + bigblindSize;
    if (newBetSize - currentBetSize > availableAction.maxSize) {
      newBetSize = availableAction.maxSize + currentBetSize;
    }
    playStickClick();
    setBetSize(newBetSize);
  };

  const valueOfPercent = (percent) => {
    return Math.round((pot * percent) / 100);
  };

  const potPercentDisable = (percent) => {
    let bet = valueOfPercent(percent);
    return bet < availableAction.minSize + currentBetSize;
  };

  useEffect(() => {
    if (availableAction) {
      setBetSize(availableAction.minSize + currentBetSize);
    }
  }, [availableAction, currentBetSize]);

  useEffect(() => {
    if (inputRef?.current) inputRef.current.value = betSize;
  }, [betSize]);

  return (
    <div
      className={
        className +
        " text-white p-4 rounded-full uppercase m-8 text-4xl text-center flex flex-row items-center justify-center flex-nowrap select-none overflow-hidden" +
        (expand ? "" : " active:brightness-50 cursor-pointer")
      }
      style={{
        width: expand ? "50rem" : "16rem",
        justifyContent: expand ? "space-around" : "center",
        transition: "width 0.2s ease-in-out",
      }}
      tabIndex="-1"
      onClick={buttonClickHandler}
    >
      <div className="" onClick={() => setShowSelectBetSize(false)}>
        {title}
      </div>
      {expand && (
        <>
          <ActionSubButton
            title="Half Pot"
            onClick={checkBetSize}
            value={valueOfPercent(50)}
            disable={potPercentDisable(50)}
          >
            1/2
          </ActionSubButton>
          <ActionSubButton
            title="3/4 Pot"
            onClick={checkBetSize}
            value={valueOfPercent(75)}
            disable={potPercentDisable(75)}
          >
            3/4
          </ActionSubButton>
          <ActionSubButton
            title="Full Pot"
            onClick={checkBetSize}
            value={valueOfPercent(100)}
            disable={potPercentDisable(100)}
          >
            full
          </ActionSubButton>
          <ActionSubButton
            title="All In"
            onClick={checkBetSize}
            value={availableAction.maxSize + currentBetSize}
            disable={false}
          >
            all in
          </ActionSubButton>
          <div className="flex items-center justify-center text-white h-full hover:text-slate-700 cursor-pointer active:scale-95">
            <AiOutlineMinusCircle onClick={minusButtonHandler} />
          </div>
          <input
            className="w-24 bg-white rounded-full text-xl text-black font-bold p-2 text-center cursor-pointer outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onBlur={(e) => checkBetSize(e.target.value)}
            defaultValue={betSize}
            ref={inputRef}
          ></input>
          <div className="flex items-center justify-center text-white h-full hover:text-slate-700 cursor-pointer active:scale-95">
            <AiOutlinePlusCircle onClick={plusButtonHandler} />
          </div>
          <div className="w-12 h-0 relative">
            <div
              className="absolute flex items-center justify-center text-white rounded-full h-full hover:text-slate-700 text-7xl cursor-pointer active:scale-95"
              title="Confirm"
            >
              <AiFillUpCircle onClick={confirm} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ActionSubButton = ({ children, onClick, value, disable, title }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disable) onClick(value);
      }}
      className={
        "flex items-center justify-center rounded-full px-4 py-1 font-bold bg-white text-cyan-500 h-full text-lg whitespace-nowrap" +
        (disable
          ? " opacity-50"
          : " hover:bg-slate-700 cursor-pointer active:scale-95")
      }
      title={title}
    >
      {children}
    </div>
  );
};
