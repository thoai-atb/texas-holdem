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
    botDefeatedList,
  } = useGame();
  const [gameTime, setGameTime] = useState("");
  const [timesWonShowAll, setTimesWonShowAll] = useState(false);
  const [biggestPotWonShowAll, setBiggestPotWonShowAll] = useState(false);
  const [botsDefeatedShowAll, setBotsDefeatedShowAll] = useState(false);
  const [moneyDonatedShowAll, setMoneyDonatedShowAll] = useState(false);
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
                <StatisticItem key={p.id} value={playersRanking[p.seatIndex]}>
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
                <StatisticItem key={p.id} value={p.timesWorked}>
                  Times <Name player={p} /> worked
                </StatisticItem>
              ))}
          </StatisticHeader>
          <StatisticHeader
            title="Times won"
            toggleExtra={() => setTimesWonShowAll((s) => !s)}
            extra={timesWonShowAll}
          >
            {players
              .concat(timesWonShowAll ? botDefeatedList : [])
              .filter((p) => p && (!p.isBot || p.timesWon > 0))
              .sort((a, b) => b.timesWon - a.timesWon)
              .map((p) =>
                p.defeated ? (
                  <StatisticDeadItem key={p.id} value={p.timesWon}>
                    Times <DeadName player={p} /> won
                  </StatisticDeadItem>
                ) : (
                  <StatisticItem key={p.id} value={p.timesWon}>
                    Times <Name player={p} /> won
                  </StatisticItem>
                )
              )}
          </StatisticHeader>
          <StatisticHeader
            title="Biggest pot won"
            toggleExtra={() => setBiggestPotWonShowAll((s) => !s)}
            extra={biggestPotWonShowAll}
          >
            {players
              .concat(biggestPotWonShowAll ? botDefeatedList : [])
              .filter((p) => p && (!p.isBot || p.biggestPotWon > 0))
              .sort((a, b) => b.biggestPotWon - a.biggestPotWon)
              .map((p) =>
                p.defeated ? (
                  <StatisticDeadItem key={p.id} value={`$${p.biggestPotWon}`}>
                    Biggest pot <DeadName player={p} /> won
                  </StatisticDeadItem>
                ) : (
                  <StatisticItem key={p.id} value={`$${p.biggestPotWon}`}>
                    Biggest pot <Name player={p} /> won
                  </StatisticItem>
                )
              )}
          </StatisticHeader>
          <StatisticHeader
            title="Bots defeated by players"
            toggleExtra={() => setBotsDefeatedShowAll((s) => !s)}
            extra={botsDefeatedShowAll}
          >
            {players
              .concat(botsDefeatedShowAll ? botDefeatedList : [])
              .filter((p) => p && (!p.isBot || p.botsDefeated > 0))
              .sort((a, b) => b.botsDefeated - a.botsDefeated)
              .map((p) =>
                p.defeated ? (
                  <StatisticDeadItem key={p.id} value={p.botsDefeated}>
                    Bots defeated by <DeadName player={p} />
                  </StatisticDeadItem>
                ) : (
                  <StatisticItem key={p.id} value={p.botsDefeated}>
                    Bots defeated by <Name player={p} />
                  </StatisticItem>
                )
              )}
          </StatisticHeader>
          <StatisticHeader
            title="Money donated"
            toggleExtra={() => setMoneyDonatedShowAll((s) => !s)}
            extra={moneyDonatedShowAll}
          >
            {players
              .concat(moneyDonatedShowAll ? botDefeatedList : [])
              .filter((p) => p && (!p.isBot || p.donated !== 0))
              .sort((a, b) => b.donated - a.donated)
              .map((p) =>
                p.defeated ? (
                  <StatisticDeadItem key={p.id} value={"$" + Math.abs(p.donated)}>
                    {p.donated < 0 ? "Received by" : "Money donated by"} <DeadName player={p} />
                  </StatisticDeadItem>
                ) : (
                  <StatisticItem key={p.id} value={"$" + Math.abs(p.donated)}>
                    {p.donated < 0 ? "Received by" : "Money donated by"} <Name player={p} />
                  </StatisticItem>
                )
              )}
          </StatisticHeader>
          <div className="text-center opacity-50 mt-4">~ End ~</div>
        </div>
      </div>
    </>
  );
}

function StatisticHeader({ title, children, toggleExtra, extra }) {
  const { playStickClick } = useSoundContext();
  const handleToggle = () => {
    if (toggleExtra) {
      playStickClick();
      toggleExtra();
    }
  };
  return (
    <>
      <div
        className={
          "text-base select-none my-2 font-bold" +
          (toggleExtra
            ? " cursor-pointer hover:text-cyan-500"
            : " cursor-default")
        }
        onClick={handleToggle}
      >
        {title}
        {extra && (
          <span className="mx-2 opacity-50 font-normal text-white">
            (all)
          </span>
        )}
      </div>
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

function StatisticDeadItem({ children, value }) {
  return (
    <div className={"text-lg opacity-60"}>
      <span>{children}: </span>
      <span className={"mx-2 text-white"}>{value}</span>
    </div>
  );
}

function Name({ player }) {
  return (
    <span className={"italic"}>
      <span className="relative inline-block rounded-full w-4 h-4 overflow-hidden ml-1 mr-1.5 translate-y-0.5">
        <img src={player.avatarURL} alt="avatar" />
      </span>
      <span className={player.isBot ? "" : "text-yellow-500"}>
        {player.name}
      </span>
    </span>
  );
}

function DeadName({ player }) {
  return (
    <span className={"italic"}>
      <span className="w-4 h-4 mr-0.5">☠️</span>
      <span>{player.name}</span>
    </span>
  );
}
