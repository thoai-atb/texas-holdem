import cardBackHalloween from "../../../assets/texture/card-back-tet.jpg";
import { CardSuit } from "../../../utilities/card";

export function CardDisplayTet({ card, hidden, showDown, highlight }) {
  return (
    <div
      className={
        "transition duration-500 w-16 h-24 m-0.5 flex justify-center items-center select-none rounded-lg relative" +
        (showDown ? (highlight ? " -translate-y-5" : " ") : " ") +
        (card ? " bg-white overflow-hidden" : " bg-transparent")
      }
    >
      {card && !hidden && (
        <div
          className={
            ["♥", "♦"].includes(card.suit) ? " text-red-600" : " text-black"
          }
        >
          <div className="absolute top-0.5 left-1">
            <div className="text-3xl h-6 font-bold font-playing-card">
              {card.value}
            </div>
            <div className="text-3xl h-6 mt-0.5">{card.suit}</div>
          </div>
          <div className="absolute bottom-1 -right-4 clear-both">
            <div className="text-5xl">{getSymbol(card.suit)}</div>
          </div>
        </div>
      )}
      {hidden && (
        <div
          className="w-5/6 h-5/6 rounded-lg"
          style={{
            backgroundImage: `url(${cardBackHalloween})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      )}
    </div>
  );
}

function getSymbol(cardSuit) {
  switch (cardSuit) {
    case CardSuit.SPADE:
      return "🐉"; // Dragon for Spades
    case CardSuit.HEART:
      return "🧧"; // Envelope for Heartss
    case CardSuit.DIAMOND:
      return "🏮"; // Lantern for Diamonds
    case CardSuit.CLUB:
      return "🪭"; // Fan for Clubs
    default:
      return "Invalid Suit";
  }
}
