export function generateDeck() {
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suits = ["♥", "♠", "♦", "♣"];
  const deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      deck.push({
        value,
        suit,
      });
    });
  });
  // shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }
  return deck;
}

export function dealCards(deck, numberOfCards) {
  const cards = [];
  for (let i = 0; i < numberOfCards; i++) {
    cards.push(deck.pop());
  }
  return cards;
}