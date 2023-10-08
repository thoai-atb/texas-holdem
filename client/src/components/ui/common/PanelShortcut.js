export function PanelShortCut({ shortcutKey }) {
  return (
    <span className="relative">
      <span className="absolute translate-y-1 text-gray-300 text-sm px-2 text-center">[{shortcutKey}]</span>
    </span>
  );
}
