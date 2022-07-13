import { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { useGame } from "../../contexts/Game";
import { useSoundContext } from "../../contexts/Sound";

export function FirstPlayerDialog() {
  const { showFirstPlayerDialog, setShowFirstPlayerDialog, socket } =
    useContext(AppContext);
  const { players } = useGame();
  const { playBubbleClick } = useSoundContext();
  function handleAction(func) {
    return () => {
      playBubbleClick();
      func();
    };
  }
  useEffect(() => {
    const numPlayers = players.filter((p) => p).length;
    if (numPlayers === 1) {
      setShowFirstPlayerDialog(true);
    }
  }, [players, setShowFirstPlayerDialog]);
  if (!showFirstPlayerDialog) return null;
  return (
    <>
      <div className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"></div>
      <div
        className="bg-black bg-opacity-80 text-white z-10 top-8 rounded-2xl absolute px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "20rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">
          Play with bots?
        </div>
        <div className="text-center">
          This table has nobody else yet, do you want to play with bots instead?
        </div>
        <div className="flex items-center justify-center gap-4">
          <PanelButton
            text="No"
            onClick={handleAction(() => setShowFirstPlayerDialog(false))}
          />
          <PanelButton
            text="Yes"
            onClick={handleAction(() => {
              setShowFirstPlayerDialog(false);
              socket.emit("chat_message", "/fill_bots");
            })}
          />
        </div>
      </div>
    </>
  );
}

function PanelButton({ text, onClick = () => {} }) {
  return (
    <div
      onClick={onClick}
      className="flex w-full items-center justify-center rounded-full px-4 py-1 font-bold bg-slate-700 text-cyan-500 h-16 my-4 text-lg whitespace-nowrap hover:bg-slate-800 cursor-pointer active:scale-95"
    >
      {text}
    </div>
  );
}
