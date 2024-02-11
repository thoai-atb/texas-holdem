import { useGame } from "../../../contexts/Game";
import { DecorationChristmas } from "./DecorationChristmas";
import { DecorationHalloween } from "./DecorationHalloween";
import { DecorationTet } from "./DecorationTet";

export function Decoration() {
  const { gameTheme } = useGame();
  if (["halloween"].includes(gameTheme)) return <DecorationHalloween />;
  if (["christmas"].includes(gameTheme)) return <DecorationChristmas />;
  if (["tet"].includes(gameTheme)) return <DecorationTet />;
  return null;
}
