import { useContext, useEffect, useState } from "react";
import { useGame } from "../../contexts/Game";
import { PanelShortCut } from "./common/PanelShortcut";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";
import { timeAgo } from "../../utilities/time";

export function Statistics({ hidden, setHidden }) {
  const { appAction, setAppAction } = useContext(AppContext);
  const { playBubbleClick } = useSoundContext();
  const {
    botsDefeated,
    players,
    roundsPlayed,
    playersRanking,
    gameCreationTimeStamp,
  } = useGame();
  const [gameTime, setGameTime] = useState("");
  useEffect(() => {
    if (appAction === "s_pressed") {
      playBubbleClick();
      setHidden(!hidden);
      setAppAction(null);
    }
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setGameTime(timeAgo(Date.now(), gameCreationTimeStamp));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameCreationTimeStamp]);
  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="bg-black bg-opacity-80 text-white z-10 rounded-2xl absolute top-20 right-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up overflow-hidden"
        style={{ width: "27rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">
          Statistics
          <PanelShortCut shortcutKey={"S"} />
        </div>
        <hr></hr>
        <div
          className="overflow-x-hidden overflow-y-scroll hide-scrollbar"
          style={{ maxHeight: "40rem" }}
        >
          <StatisticHeader title="General">
            <StatisticItem value={roundsPlayed}>Rounds played</StatisticItem>
            <StatisticItem value={botsDefeated}>Bots defeated</StatisticItem>
            <StatisticItem value={gameTime}>Game time</StatisticItem>
          </StatisticHeader>
          <StatisticHeader title="Leader board">
            {players
              .filter((p) => p && playersRanking[p.seatIndex] > 0)
              .sort(
                (a, b) =>
                  playersRanking[a.seatIndex] - playersRanking[b.seatIndex]
              )
              .map((p) => (
                <StatisticItem key={p.name} value={playersRanking[p.seatIndex]}>
                  Rank of <Name player={p} />
                </StatisticItem>
              ))}
            {players.filter((p) => p && playersRanking[p.seatIndex] > 0)
              .length === 0 && <StatisticItem comment="empty" />}
          </StatisticHeader>
          <StatisticHeader title="Times worked">
            {players
              .filter((p) => p && !p.isBot)
              .sort((a, b) => b.timesWorked - a.timesWorked)
              .map((p) => (
                <StatisticItem key={p.name} value={p.timesWorked}>
                  Times <Name player={p} /> worked
                </StatisticItem>
              ))}
          </StatisticHeader>
          <StatisticHeader title="Times won">
            {players
              .filter((p) => p && (!p.isBot || p.timesWon > 0))
              .sort((a, b) => b.timesWon - a.timesWon)
              .map((p) => (
                <StatisticItem key={p.name} value={p.timesWon}>
                  Times <Name player={p} /> won
                </StatisticItem>
              ))}
          </StatisticHeader>
          <StatisticHeader title="Biggest pot won">
            {players
              .filter((p) => p && (!p.isBot || p.biggestPotWon > 0))
              .sort((a, b) => b.biggestPotWon - a.biggestPotWon)
              .map((p) => (
                <StatisticItem key={p.name} value={`$${p.biggestPotWon}`}>
                  Biggest pot <Name player={p} /> won
                </StatisticItem>
              ))}
          </StatisticHeader>
          <StatisticHeader title="Bots defeated by players">
            {players
              .filter((p) => p && (!p.isBot || p.botsDefeated > 0))
              .sort((a, b) => b.botsDefeated - a.botsDefeated)
              .map((p) => (
                <StatisticItem key={p.name} value={p.botsDefeated}>
                  Bots defeated by <Name player={p} />
                </StatisticItem>
              ))}
          </StatisticHeader>
          <div className="text-center opacity-50 mt-4">~ End ~</div>
        </div>
      </div>
    </>
  );
}

function Name({ player }) {
  return (
    <span className={"italic"}>
      <span className="relative inline-block rounded-full w-4 h-4 overflow-hidden mr-1 translate-y-0.5">
        <img src={player.avatarURL} alt="avatar" />
      </span>
      <span className={player.isBot ? "" : "text-yellow-500"}>
        {player.name}
      </span>
    </span>
  );
}

function StatisticHeader({ title, children }) {
  return (
    <>
      <div className="text-base my-2 font-bold">{title}</div>
      <div className="ml-4">{children}</div>
    </>
  );
}

function StatisticItem({ children, value, comment }) {
  if (comment) {
    return (
      <div className="text-lg text-gray-400">
        <span>({comment})</span>
      </div>
    );
  }
  return (
    <div className="text-lg">
      <span>{children}: </span>
      <span className="text-cyan-500 mx-2">{value}</span>
    </div>
  );
}
