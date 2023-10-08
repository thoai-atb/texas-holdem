import { useContext, useEffect } from "react";
import { useGame } from "../../contexts/Game";
import { PanelShortCut } from "./common/PanelShortcut";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";

export function Statistics({ hidden, setHidden }) {
  const { appAction, setAppAction } = useContext(AppContext);
  const { playBubbleClick } = useSoundContext();
  const { botsDefeated, players, gamesPlayed, playersRanking } = useGame();
  useEffect(() => {
    if (appAction === "s_pressed") {
      playBubbleClick();
      setHidden(!hidden);
      setAppAction(null);
    }
  });
  if (hidden) return null;
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setHidden(true)}
      ></div>
      <div
        className="bg-black bg-opacity-80 text-white z-10 rounded-2xl absolute top-20 right-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "25rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">
          Statistics
          <PanelShortCut shortcutKey={"S"} />
        </div>
        <hr></hr>
        <StatisticHeader title="General">
          <StatisticItem title="Games played" value={gamesPlayed} />
          <StatisticItem title="Bots defeated" value={botsDefeated} />
        </StatisticHeader>
        <StatisticHeader title="Bots defeated by players">
          {players
            .filter((p) => p && !p.isBot)
            .map((p) => (
              <StatisticItem
                key={p.name}
                title={`Bots defeated by ${p.name}`}
                value={p.botsDefeated}
              />
            ))}
          {players
            .filter((p) => p && p.isBot && playersRanking[p.seatIndex] > 0)
            .map((p) => (
              <StatisticItem
                key={p.name}
                title={`Bots defeated by ${p.name}`}
                value={p.botsDefeated}
              />
            ))}
        </StatisticHeader>
        <StatisticHeader title="Times won">
          {players
            .filter((p) => p && !p.isBot)
            .map((p) => (
              <StatisticItem
                key={p.name}
                title={`Times ${p.name} won`}
                value={p.timesWon}
              />
            ))}
          {players
            .filter((p) => p && p.isBot && playersRanking[p.seatIndex] > 0)
            .map((p) => (
              <StatisticItem
                key={p.name}
                title={`Times ${p.name} won`}
                value={p.timesWon}
              />
            ))}
        </StatisticHeader>
        <StatisticHeader title="Times worked">
          {players
            .filter((p) => p && !p.isBot)
            .map((p) => (
              <StatisticItem
                key={p.name}
                title={`Times ${p.name} worked`}
                value={p.timesWorked}
              />
            ))}
        </StatisticHeader>
      </div>
    </>
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

function StatisticItem({ title, value }) {
  return (
    <div className="text-lg">
      <span>{title}: </span>
      <span className="text-cyan-500 mx-2">{value}</span>
    </div>
  );
}