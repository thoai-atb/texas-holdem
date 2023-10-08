import { useContext } from "react";
import { AppContext } from "../../App";
import { useSoundContext } from "../../contexts/Sound";
import { BsFillVolumeMuteFill, BsFillVolumeUpFill } from "react-icons/bs";
import { VolumeOption } from "./VolumeOption";

export function Settings() {
  const {
    showSettings,
    setShowSettings,
    showHandStatistics,
    setShowHandStatistics,
    setMuted,
    muted,
    autoCheckCall,
    autoCheckFold,
    setAutoCheckCall,
    setAutoCheckFold,
  } = useContext(AppContext);
  const { playStickClick } = useSoundContext();
  if (!showSettings) return null;
  function handleAction(func) {
    return () => {
      func();
      playStickClick();
    };
  }
  return (
    <>
      <div
        className="absolute w-full h-full bg-black opacity-25 pointer-events-auto"
        onClick={() => setShowSettings(false)}
      ></div>
      <div
        className="bg-black bg-opacity-80 text-white z-10 rounded-2xl absolute top-20 right-8 px-8 py-5 flex flex-col pointer-events-auto animate-fade-in-up"
        style={{ width: "20rem" }}
      >
        <div className="text-xl font-bold text-center mb-4">Settings</div>
        <hr></hr>
        <VolumeField
          muted={muted}
          toggleMuted={handleAction(() => setMuted((m) => !m))}
        />
        <ToggleField
          label="Hand ranks calculator"
          shortcut="R"
          active={showHandStatistics}
          onToggle={handleAction(() => setShowHandStatistics((s) => !s))}
        />
        <ToggleField
          label="AFK mode (check/call)"
          shortcut=""
          active={autoCheckCall}
          onToggle={handleAction(() => setAutoCheckCall((c) => !c))}
        />
        <ToggleField
          label="AFK mode (check/fold)"
          shortcut=""
          active={autoCheckFold}
          onToggle={handleAction(() => setAutoCheckFold((f) => !f))}
        />
      </div>
    </>
  );
}

function VolumeField({ muted, toggleMuted }) {
  return (
    <div
      className="w-full flex my-4 justify-between items-center cursor-pointer select-none group text-2xl"
      onClick={toggleMuted}
    >
      {muted && <BsFillVolumeMuteFill />}
      {!muted && <BsFillVolumeUpFill />}
      <VolumeOption />
    </div>
  );
}

function ToggleField({ label, shortcut, active, onToggle }) {
  return (
    <div
      className="w-full flex my-2 justify-between items-center cursor-pointer select-none group"
      onClick={onToggle}
    >
      <span>
        {label}{" "}
        {shortcut && <span className="text-gray-500">[{shortcut}]</span>}
      </span>
      {active ? (
        <span className="text-cyan-500 group-hover:text-white">On</span>
      ) : (
        <span className="text-gray-500 group-hover:text-white">Off</span>
      )}
    </div>
  );
}
