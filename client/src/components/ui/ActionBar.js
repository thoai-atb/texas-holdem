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
  const { autoCheckCall, autoCheckFold, showWorkPanel, setShowWorkPanel } =
    useContext(AppContext);
  const {
    takeAction,
    isPlaying,
    players,
    seatIndex,
    turnIndex,
    availableActions,
    showDown,
    bigblindSize,
    bets,
  } = useGame();
  const [showBetLevel, setShowSelectBetLevel] = React.useState(false);
  if (!players || !players[seatIndex]) return null;
  const thisPlayer = players[seatIndex];
  const betOnTable = bets[seatIndex];
  const disable = !isPlaying || seatIndex !== turnIndex;
  if (autoCheckCall || autoCheckFold) {
    return (
      <div className="w-full flex items-center justify-center pointer-events-auto">
        <div className="flex items-center justify-center tracking-widest text-2xl text-black opacity-50 m-8 p-4">
          - YOU ARE AFK{" "}
          {autoCheckCall
            ? "CHECK/CALL"
            : "CHECK/FOLD"}{" "}
          -
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
      {!showWorkPanel &&
        !thisPlayer.ready &&
        thisPlayer.stack < bigblindSize && (
          <WorkButton
            action={() => setShowWorkPanel(true)}
            title="You're broke! Click here to work for money 💸"
            className=""
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
              showSelectBet={showBetLevel}
              setShowSelectBet={setShowSelectBetLevel}
              key={index}
              availableAction={action}
              takeAction={takeAction}
              title={action.type + (displaySize ? ` $${displaySize}` : "")}
              className={className}
              stack={thisPlayer.stack}
              betOnTable={betOnTable}
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
  showSelectBet,
  setShowSelectBet,
  availableAction,
  stack,
  betOnTable,
}) => {
  const { playBubbleClick, playStickClick } = useSoundContext();
  const inputRef = React.useRef();
  const [betLevel, setBetLevel] = React.useState(0); // bet level includes bets already on the table
  const { currentBetSize, bigblindSize, pot } = useGame();
  const isAggressive =
    availableAction.type === "raise" || availableAction.type === "bet";
  const maxBetLevel = availableAction.maxSize + currentBetSize;
  const minBetLevel = availableAction.minSize + currentBetSize;
  const expand = isAggressive && showSelectBet;

  const buttonClickHandler = () => {
    if (isAggressive) {
      if (!showSelectBet) {
        playBubbleClick();
        setShowSelectBet(true);
      }
    } else {
      playBubbleClick();
      takeAction({ type: availableAction.type });
    }
  };

  const confirm = (e) => {
    e.stopPropagation();
    const size = parseInt(betLevel) - currentBetSize;
    if (size < availableAction.minSize || size > availableAction.maxSize) {
      alert("Invalid bet size");
      return;
    }
    setShowSelectBet(false);
    playStickClick();
    takeAction({ type: availableAction.type, size: size });
  };

  const minusButtonHandler = () => {
    let newBetLevel = betLevel - bigblindSize / 2;
    if (newBetLevel - currentBetSize < availableAction.minSize) {
      newBetLevel = minBetLevel;
    }
    playStickClick();
    setBetLevel(newBetLevel);
  };

  const checkBetLevel = (value) => {
    if (typeof value === "string") value = parseInt(value);
    if (!value) return;
    if (value < minBetLevel) {
      value = minBetLevel;
    } else if (value > maxBetLevel) {
      value = maxBetLevel;
    }
    playStickClick();
    setBetLevel(value);
  };

  const plusButtonHandler = () => {
    var newBetLevel = betLevel + bigblindSize / 2;
    if (newBetLevel - currentBetSize > availableAction.maxSize) {
      newBetLevel = maxBetLevel;
    }
    playStickClick();
    setBetLevel(newBetLevel);
  };

  const valueOfPercent = (percent) => {
    return Math.round((pot * percent) / 100);
  };

  const potPercentDisable = (percent) => {
    let bet = valueOfPercent(percent);
    return bet < minBetLevel || betLevel === bet;
  };

  useEffect(() => {
    if (availableAction) {
      setBetLevel(minBetLevel);
    }
  }, [availableAction, currentBetSize, minBetLevel]);

  useEffect(() => {
    if (inputRef?.current) inputRef.current.value = betLevel;
  }, [betLevel]);

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
      <div className="" onClick={() => setShowSelectBet(false)}>
        {title}
      </div>
      {expand && (
        <>
          <ActionSubButton
            title="Min"
            onClick={checkBetLevel}
            value={minBetLevel}
            disable={betLevel === minBetLevel}
          >
            min
          </ActionSubButton>
          <ActionSubButton
            title="Half Pot"
            onClick={checkBetLevel}
            value={valueOfPercent(50)}
            disable={potPercentDisable(50)}
          >
            1/2
          </ActionSubButton>
          <ActionSubButton
            title="3/4 Pot"
            onClick={checkBetLevel}
            value={valueOfPercent(75)}
            disable={potPercentDisable(75)}
          >
            3/4
          </ActionSubButton>
          <ActionSubButton
            title="Full Pot"
            onClick={checkBetLevel}
            value={valueOfPercent(100)}
            disable={potPercentDisable(100)}
          >
            full
          </ActionSubButton>
          <ActionSubButton
            title={maxBetLevel === stack + betOnTable ? "All In" : "Max"}
            onClick={checkBetLevel}
            value={maxBetLevel}
            disable={betLevel === maxBetLevel}
          >
            {maxBetLevel === stack + betOnTable ? "all in" : "max"}
          </ActionSubButton>
          <ActionAdjustButton
            disable={betLevel === minBetLevel}
            onClick={minusButtonHandler}
            Icon={AiOutlineMinusCircle}
          />
          <input
            className="w-24 bg-white rounded-full text-xl text-black font-bold p-2 text-center cursor-pointer outline-none"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onBlur={(e) => checkBetLevel(e.target.value)}
            defaultValue={betLevel}
            ref={inputRef}
          ></input>
          <ActionAdjustButton
            disable={betLevel === maxBetLevel}
            onClick={plusButtonHandler}
            Icon={AiOutlinePlusCircle}
          />
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

const ActionAdjustButton = ({ disable, onClick, Icon }) => {
  const clickHandler = (e) => {
    e.stopPropagation();
    if (disable) return;
    onClick();
  };
  return (
    <div
      className={
        "flex items-center justify-center text-white h-full" +
        (disable
          ? " opacity-50"
          : " hover:text-slate-700 cursor-pointer active:scale-95")
      }
    >
      <Icon onClick={clickHandler}></Icon>
    </div>
  );
};

const WorkButton = ({ action, title, className }) => {
  const { playBubbleClick } = useSoundContext();
  return (
    <button
      className={
        className +
        " border-2 border-cyan-500 text-cyan-500 p-4 bg-white bg-opacity-50" +
        " rounded-full m-8 text-xl text-center hover:bg-opacity-80"
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
