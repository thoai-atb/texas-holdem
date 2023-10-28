export const CardSuit = {
  SPADE: "♠",
  DIAMOND: "♦",
  CLUB: "♣",
  HEART: "♥",
};

export const CardValue = {
  ACE: "A",
  TWO: "2",
  THREE: "3",
  FOUR: "4",
  FIVE: "5",
  SIX: "6",
  SEVEN: "7",
  EIGHT: "8",
  NINE: "9",
  TEN: "10",
  JACK: "J",
  QUEEN: "Q",
  KING: "K",
};

export function getHalloweenSymbol(cardSuit) {
  switch (cardSuit) {
    case CardSuit.SPADE:
      return "🦇"; // Bat for Spades
    case CardSuit.HEART:
      return "🎃"; // Pumpkin for Hearts
    case CardSuit.DIAMOND:
      return "🧙"; // Spider for Diamonds
    case CardSuit.CLUB:
      return "🕸️"; // Ghost for Clubs
    default:
      return "Invalid Suit";
  }
}
