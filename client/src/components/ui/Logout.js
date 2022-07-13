import { useContext } from "react";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";

export function Logout() {
  const { showLogout, setShowLogout, socket } = useContext(AppContext);
  const { playBubbleClick } = useSoundContext();
  if (!showLogout) return null;
  function handleAction(func) {
    return () => {
      playBubbleClick();
      func();
    };
  }
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setShowLogout(false)}
      ></div>

      <div
        className="bg-black bg-opacity-80 text-white z-10 rounded-2xl absolute top-20 left-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "25rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">Leave Table</div>
        <div className="text-center">
          Are you sure you want to quit the game now?
        </div>
        <div className="flex items-center justify-center gap-4">
          <PanelButton
            text="No"
            onClick={handleAction(() => setShowLogout(false))}
          />
          <PanelButton
            text="Yes"
            onClick={handleAction(() => {
              setShowLogout(false);
              socket.disconnect();
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
