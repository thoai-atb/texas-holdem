const { evaluate } = require('./evaluator');
const { CardSuit, CardValue } = require("./enum");

function getStrengthDelta(hand1, hand2, board) {
  const parseCard = (card) => {
    const [value, suit] = [card.slice(0, -1), card.slice(-1)];
    return { suit: suitToEnum(suit), value: valueToEnum(value) };
  };

  const suitToEnum = (suit) => ({
    "♠": CardSuit.SPADE,
    "♥": CardSuit.HEART,
    "♦": CardSuit.DIAMOND,
    "♣": CardSuit.CLUB
  })[suit];

  const valueToEnum = (value) => ({
    "2": CardValue.TWO, "3": CardValue.THREE, "4": CardValue.FOUR,
    "5": CardValue.FIVE, "6": CardValue.SIX, "7": CardValue.SEVEN,
    "8": CardValue.EIGHT, "9": CardValue.NINE, "10": CardValue.TEN,
    "J": CardValue.JACK, "Q": CardValue.QUEEN, "K": CardValue.KING, "A": CardValue.ACE
  })[value];

  const parsedHand1 = hand1.map(parseCard);
  const parsedHand2 = hand2.map(parseCard);
  const parsedBoard = board.map(parseCard);

  return evaluate(parsedHand1, parsedBoard).strength - evaluate(parsedHand2, parsedBoard).strength;
}

test('High Card no Kicker = High Card no Kicker', () => {
  expect(getStrengthDelta(['4♣', '3♦'], ['4♥', '5♠'], ['9♦', 'A♣', 'K♠', 'J♦', '10♥'])).toBe(0);
});

test('Higher High Card > Lower High Card', () => {
  expect(getStrengthDelta(['A♠', 'K♣'], ['K♦', 'Q♣'], ['J♥', '5♠', '10♦', '7♣', '8♥'])).toBeGreaterThan(0);
});

test('Pair > High Card', () => {
  expect(getStrengthDelta(['8♦', '2♣'], ['A♥', 'K♠'], ['10♥', 'J♠', '2♦', '9♣', '7♥'])).toBeGreaterThan(0);
});

test('Higher Pair > Lower Pair', () => {
  expect(getStrengthDelta(['Q♣', '3♦'], ['J♠', 'J♦'], ['10♥', '2♣', 'Q♦', '9♣', '7♥'])).toBeGreaterThan(0);
});

test('Pair with higher kicker > Pair with lower kicker', () => {
  expect(getStrengthDelta(['A♠', 'K♣'], ['A♦', 'Q♠'], ['J♥', 'A♣', '10♦', '7♣', '8♥'])).toBeGreaterThan(0);
});

test('Two Pair > One Pair', () => {
  expect(getStrengthDelta(['Q♦', 'J♦'], ['K♠', '5♣'], ['Q♠', 'J♠', '4♥', '6♣', 'K♦'])).toBeGreaterThan(0);
});

test('Higher Two Pair > Lower Two Pair', () => {
  expect(getStrengthDelta(["K♠", "2♦"], ["Q♠", "J♣"], ["Q♦", "J♠", "K♣", "8♥", "2♣"])).toBeGreaterThan(0)
});

test('Two Pair with Higher Kicker > Two Pair', () => {  
  expect(getStrengthDelta(["K♠", "Q♦"], ["K♣", "J♣"], ["K♥", "8♠", "5♣", "8♥", "2♦"])).toBeGreaterThan(0);  
});

test('Two Pair no Kicker = Two Pair no Kicker', () => {  
  expect(getStrengthDelta(["K♠", "2♦"], ["K♥", "3♠"], ["J♠", "J♣", "K♣", "8♥", "2♣"])).toBe(0);  
});

test('Three of a Kind > Two Pair', () => {
  expect(getStrengthDelta(['Q♥', 'Q♣'], ['J♦', '10♠'], ['Q♠', 'J♣', '10♦', '8♠', '4♥'])).toBeGreaterThan(0);
});

test('Straight > Three of a Kind', () => {
  expect(getStrengthDelta(['6♦', '7♠'], ['8♣', '8♥'], ['5♥', '4♠', '3♦', '8♦', 'J♣'])).toBeGreaterThan(0);
});

test('Flush > Straight', () => {
  expect(getStrengthDelta(['A♠', '5♠'], ['6♦', '5♣'], ['7♠', '8♦', '9♣', '2♠', 'K♠'])).toBeGreaterThan(0);
});

test('Ace-high flush > King-Queen flush', () => {
  expect(getStrengthDelta(['A♠', '2♦'], ['K♠', 'Q♠'], ['10♠', '9♠', '8♠', '4♠', '3♥'])).toBeGreaterThan(0);
});

test('Full House > Flush', () => {
  expect(getStrengthDelta(['Q♥', 'Q♦'], ['4♥', '9♥'], ['Q♠', '5♥', '5♦', 'K♥', '3♥'])).toBeGreaterThan(0);
});

test('Bigger Full House > Smaller Full House', () => {
  expect(getStrengthDelta(['Q♥', 'Q♣'], ['J♦', '10♠'], ['Q♠', 'J♣', 'J♥', '10♦', '8♠'])).toBeGreaterThan(0);
});

test('Four of a Kind > Full House', () => {
  expect(getStrengthDelta(['J♠', 'J♦'], ['10♠', '10♦'], ['J♥', 'J♣', '10♣', '3♦', '5♠'])).toBeGreaterThan(0);
});

test('Straight Flush > Four of a Kind', () => {
  expect(getStrengthDelta(['J♠', '10♠'], ['Q♣', 'Q♦'], ['Q♠', 'Q♥', '9♠', '8♠', '7♠'])).toBeGreaterThan(0);
});