import { useSoundContext } from "../../contexts/Sound";

export function PanelButton({ text, classnameOverride, onClick = () => {} }) {
  const { playBubbleClick } = useSoundContext();
  function handleAction(func) {
    return () => {
      playBubbleClick();
      func();
    };
  }
  return (
    <div
      onClick={handleAction(onClick)}
      className={
        "flex w-full items-center justify-center rounded-full px-4 py-1 font-bold bg-slate-700 text-cyan-500 h-16 my-4 text-lg whitespace-nowrap hover:bg-slate-800 cursor-pointer active:scale-95 " +
        classnameOverride
      }
    >
      {text}
    </div>
  );
}
