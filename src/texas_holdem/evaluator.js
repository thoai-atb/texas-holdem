const { CardSuit, CardValue } = require("./enum");

const HAND_STRENGTH_MULTIPLIER = 100000;
const HIGH_CARD_STRENGTH_ADJUSTMENT = 1; // Duece = 2, Three = 3, ..., Ace = 14

// eslint-disable-next-line no-extend-native
Array.prototype.count = function (filter) {
  let count = 0;
  for (let i = 0; i < this.length; i++) {
    if (filter(this[i])) count++;
  }
  return count;
};

function findWinners(players, board) {
  const results = players
    .filter((player) => player?.cards.length === 2 && !player.folded)
    .map((player) => ({
      ...evaluate(player.cards, board),
      index: player.seatIndex,
    }));
  const sorted = results.sort((a, b) => b.strength - a.strength);
  // find the winners
  const winners = [];
  let winner = sorted[0];
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].strength === winner.strength) {
      winners.push(sorted[i]);
    } else {
      break;
    }
  }
  return winners;
}

function evaluate(hand, board) {
  const result = evalutateRaw(hand, board);
  let sortedHand = [...hand];
  if (valueToIndex(hand[0].value) < valueToIndex(hand[1].value))
    sortedHand.reverse();
  const wrappedResult = {
    ...result,
    strength:
      // XX (hand rank) YYYYY (primary strength) ZZZZZ (secondary strength) - Each letter represents a digit
      HandRank[result.type] * HAND_STRENGTH_MULTIPLIER * HAND_STRENGTH_MULTIPLIER + result.strength
  };
  return wrappedResult;
}

function evalutateRaw(hand, board) {
  const total = [...hand, ...board];
  let matrix = convertToMatrix(total);

  // check for straight flush
  let straightFlush = -1;
  let straightFlushCards = [];
  for (let suitIdx = 0; suitIdx < matrix.length; suitIdx++) {
    const suit = matrix[suitIdx];
    let count = 0;
    for (let i = suit.length - 1; i >= 0; i--) {
      if (suit[i] === 1) {
        count++;
        straightFlushCards.push(getCard(suitIdx, i));
        if (count === 5) {
          straightFlush = i + 4;
          break;
        }
      } else {
        straightFlushCards = [];
        count = 0;
      }
    }
    if (straightFlush > 0) break;
  }
  if (straightFlush > 0) {
    const primaryStrength = adjustIndexToStrength(straightFlush); // YYYYY (primary strength)
    const result = {
      type: "straight flush",
      strength: primaryStrength * HAND_STRENGTH_MULTIPLIER, // YYYYY (primary strength)
      cards: straightFlushCards,
    };
    return result;
  }

  // check for four of a kind
  let fourOfAKind = -1;
  let fourOfAKindCards = [];
  for (let i = matrix[0].length - 1; i > 0; i--) {
    let found = matrix.every((suit) => suit[i] === 1);
    if (found) {
      fourOfAKind = i;
      for (let j = 0; j < matrix.length; j++) {
        fourOfAKindCards.push(getCard(j, i));
      }
      break;
    }
  }
  if (fourOfAKind > 0) {
    const primaryStrength = adjustIndexToStrength(fourOfAKind); // YYYYY (primary strength)
    let secondaryStrength = 0; // ZZZZZ (secondary strength)
    // find kicker card
    let kickerCard = null;
    for (let i = matrix[0].length - 1; i > 0; i--) {
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1 && i !== fourOfAKind) {
          kickerCard = getCard(j, i);
          secondaryStrength = adjustIndexToStrength(i); // ZZZZZ (secondary strength)
          break;
        }
      }
      if (kickerCard) break;
    }
    const result = {
      type: "four of a kind",
      strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
      cards: [...fourOfAKindCards, kickerCard],
    };
    return result;
  }

  // check for full house
  let threeOfAKind = -1;
  let threeOfAKindCards = [];
  for (let i = matrix[0].length - 1; i > 0; i--) {
    let found = matrix.count((suit) => suit[i] === 1) >= 3;
    if (found) {
      threeOfAKind = i;
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1) {
          threeOfAKindCards.push(getCard(j, i));
        }
      }
      break;
    }
  }
  if (threeOfAKind > 0) {
    let pairOtherThanThreeOfAKind = -1;
    let pairOtherThanThreeOfAKindCards = [];
    for (let i = matrix[0].length - 1; i > 0; i--) {
      let found = matrix.count((suit) => suit[i] === 1) >= 2;
      if (found && i !== threeOfAKind) {
        pairOtherThanThreeOfAKind = i;
        for (let j = 0; j < matrix.length; j++) {
          if (matrix[j][i] === 1) {
            pairOtherThanThreeOfAKindCards.push(getCard(j, i));
          }
        }
        break;
      }
    }
    if (pairOtherThanThreeOfAKind > 0) {
      const primaryStrength = adjustIndexToStrength(threeOfAKind); // YYYYY (primary strength)
      const secondaryStrength = adjustIndexToStrength(pairOtherThanThreeOfAKind); // ZZZZZ (secondary strength)
      const result = {
        type: "full house",
        strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
        cards: [...threeOfAKindCards, ...pairOtherThanThreeOfAKindCards],
      };
      return result;
    }
  }

  // check for flush
  let flush = -1;
  let flushCards = [];
  for (let suit of matrix) {
    flushCards = [];
    let count = 0;
    let score = 0;
    for (let i = suit.length - 1; i > 0; i--) {
      if (suit[i] === 1) {
        count++;
        score += 2 ** i; // Binary representation based on largest card value to smallest card value
        flushCards.push(getCard(matrix.indexOf(suit), i));
        if (count === 5) {
          flush = score;
          break;
        }
      }
    }
    if (flush >= 0) break;
  }
  if (flush >= 0) {
    const result = {
      type: "flush",
      strength: flush * HAND_STRENGTH_MULTIPLIER, // YYYYY (primary strength)
      cards: flushCards,
    };
    return result;
  }

  // check for straight
  let straight = -1;
  let straightCards = [];
  let count = 0;
  for (let i = matrix[0].length - 1; i >= 0; i--) {
    if (matrix.some((suit) => suit[i] === 1)) {
      count++;
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1) {
          straightCards.push(getCard(j, i));
          break;
        }
      }
      if (count === 5) {
        straight = i + 4;
        break;
      }
    } else {
      count = 0;
      straightCards = [];
    }
  }
  if (straight > 0) {
    const result = {
      type: "straight",
      strength: adjustIndexToStrength(straight) * HAND_STRENGTH_MULTIPLIER, // YYYYY (primary strength)
      cards: straightCards,
    };
    return result;
  }

  // check for three of a kind
  if (threeOfAKind >= 0) {
    // get all kicker cards
    let kickerCards = [];
    let kickerScore = 0;
    for (let i = matrix[0].length - 1; i > 0; i--) {
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1 && i !== threeOfAKind) {
          kickerCards.push(getCard(j, i));
          kickerScore += 2 ** i; // Binary representation based on largest card value to smallest card value
        }
      }
      if (kickerCards.length === 2) break;
    }
    const primaryStrength = adjustIndexToStrength(threeOfAKind); // YYYYY (primary strength)
    const secondaryStrength = kickerScore; // ZZZZZ (secondary strength)
    const result = {
      type: "three of a kind",
      strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
      cards: [...threeOfAKindCards, ...kickerCards],
    };
    return result;
  }

  // check for two pair
  let highPair = -1;
  let highPairCards = [];
  for (let i = matrix[0].length - 1; i > 0; i--) {
    let found = matrix.count((suit) => suit[i] === 1) >= 2;
    if (found) {
      highPair = i;
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1) {
          highPairCards.push(getCard(j, i));
        }
      }
      break;
    }
  }
  if (highPair > 0) {
    let secondPair = -1;
    let secondPairCards = [];
    for (let i = matrix[0].length - 1; i > 0; i--) {
      let found = matrix.count((suit) => suit[i] === 1) >= 2;
      if (found && i !== highPair) {
        secondPair = i;
        for (let j = 0; j < matrix.length; j++) {
          if (matrix[j][i] === 1) {
            secondPairCards.push(getCard(j, i));
          }
        }
        break;
      }
    }
    if (secondPair > 0) {
      // get kicker card
      let kickerCard = null;
      let kickerScore = 0;
      for (let i = matrix[0].length - 1; i > 0; i--) {
        for (let j = 0; j < matrix.length; j++) {
          if (matrix[j][i] === 1 && i !== highPair && i !== secondPair) {
            kickerCard = getCard(j, i);
            kickerScore = adjustIndexToStrength(i); // ZZZZZ (secondary strength)
            break;
          }
          if (kickerCard) break;
        }
        if (kickerCard) break;
      }
      const primaryStrength = adjustIndexToStrength(highPair) * 100 + adjustIndexToStrength(secondPair); // YYYYY (primary strength)
      const secondaryStrength = kickerScore; // ZZZZZ (secondary strength)
      const result = {
        type: "two pair",
        strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
        cards: [...highPairCards, ...secondPairCards, kickerCard],
      };
      return result;
    }
  }

  // check for pair
  if (highPair > 0) {
    // get kicker cards
    let kickerCards = [];
    let kickerScore = 0;
    for (let i = matrix[0].length - 1; i > 0; i--) {
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1 && i !== highPair) {
          kickerCards.push(getCard(j, i));
          kickerScore += 2 ** i; // Binary representation based on largest card value to smallest card value
        }
      }
      if (kickerCards.length === 3) break;
    }
    const primaryStrength = adjustIndexToStrength(highPair); // YYYYY (primary strength)
    const secondaryStrength = kickerScore; // ZZZZZ (secondary strength)
    const result = {
      type: "pair",
      strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
      cards: [...highPairCards, ...kickerCards],
    };
    return result;
  }

  // check for high card
  let highCard = -1;
  let highCardCard = null;
  for (let i = matrix[0].length - 1; i > 0; i--) {
    for (let j = 0; j < matrix.length; j++) {
      if (matrix[j][i] === 1) {
        highCard = i;
        highCardCard = getCard(j, i);
        break;
      }
    }
    if (highCard > 0) {
      break;
    }
  }
  if (highCard > 0) {
    let kickerCards = [];
    let kickerScore = 0;
    for (let i = matrix[0].length - 1; i > 0; i--) {
      for (let j = 0; j < matrix.length; j++) {
        if (matrix[j][i] === 1 && i !== highCard) {
          kickerCards.push(getCard(j, i));
          kickerScore += 2 ** i; // Binary representation based on largest card value to smallest card value
        }
      }
      if (kickerCards.length === 4) break;
    }
    const primaryStrength = adjustIndexToStrength(highCard); // YYYYY (primary strength)
    const secondaryStrength = kickerScore; // ZZZZZ (secondary strength)
    const result = {
      type: "high card",
      strength: primaryStrength * HAND_STRENGTH_MULTIPLIER + secondaryStrength,
      cards: [highCardCard, ...kickerCards],
    };
    return result;
  }

  return {
    type: "no hand",
    strength: 0,
    cards: [],
  };
}

const HandRank = {
  "no hand": 0,
  "high card": 1,
  pair: 2,
  "two pair": 3,
  "three of a kind": 4,
  straight: 5,
  flush: 6,
  "full house": 7,
  "four of a kind": 8,
  "straight flush": 9,
};

const adjustIndexToStrength = (index) => {
  return index + HIGH_CARD_STRENGTH_ADJUSTMENT;
}

const getCard = (suitIndex, valueIndex) => {
  return {
    suit: indexToSuit(suitIndex),
    value: indexToValue(valueIndex),
  };
};

const indexToValue = (index) => {
  switch (index) {
    case 0:
      return CardValue.ACE;
    case 1:
      return CardValue.TWO;
    case 2:
      return CardValue.THREE;
    case 3:
      return CardValue.FOUR;
    case 4:
      return CardValue.FIVE;
    case 5:
      return CardValue.SIX;
    case 6:
      return CardValue.SEVEN;
    case 7:
      return CardValue.EIGHT;
    case 8:
      return CardValue.NINE;
    case 9:
      return CardValue.TEN;
    case 10:
      return CardValue.JACK;
    case 11:
      return CardValue.QUEEN;
    case 12:
      return CardValue.KING;
    case 13:
      return CardValue.ACE;
    default:
      return null;
  }
};

const indexToSuit = (index) => {
  switch (index) {
    case 0:
      return CardSuit.SPADE;
    case 1:
      return CardSuit.DIAMOND;
    case 2:
      return CardSuit.CLUB;
    case 3:
      return CardSuit.HEART;
    default:
      return null;
  }
};

const valueToIndex = (value) => {
  switch (value) {
    case CardValue.ACE:
      return 13;
    case CardValue.TWO:
      return 1;
    case CardValue.THREE:
      return 2;
    case CardValue.FOUR:
      return 3;
    case CardValue.FIVE:
      return 4;
    case CardValue.SIX:
      return 5;
    case CardValue.SEVEN:
      return 6;
    case CardValue.EIGHT:
      return 7;
    case CardValue.NINE:
      return 8;
    case CardValue.TEN:
      return 9;
    case CardValue.JACK:
      return 10;
    case CardValue.QUEEN:
      return 11;
    case CardValue.KING:
      return 12;
    default:
      return null;
  }
};

const convertToMatrix = (cards) => {
  let matrix = [
    new Array(14).fill(0), // spades
    new Array(14).fill(0), // diamonds
    new Array(14).fill(0), // clubs
    new Array(14).fill(0), // hearts
  ];

  cards.forEach((card) => {
    let suitIdx = 0;
    switch (card.suit) {
      case CardSuit.SPADE:
        suitIdx = 0;
        break;
      case CardSuit.DIAMOND:
        suitIdx = 1;
        break;
      case CardSuit.CLUB:
        suitIdx = 2;
        break;
      case CardSuit.HEART:
        suitIdx = 3;
        break;
      default:
        throw new Error("Invalid card suit");
    }
    switch (card.value) {
      case CardValue.ACE:
        matrix[suitIdx][0] = 1;
        matrix[suitIdx][13] = 1;
        break;
      case CardValue.TWO:
        matrix[suitIdx][1] = 1;
        break;
      case CardValue.THREE:
        matrix[suitIdx][2] = 1;
        break;
      case CardValue.FOUR:
        matrix[suitIdx][3] = 1;
        break;
      case CardValue.FIVE:
        matrix[suitIdx][4] = 1;
        break;
      case CardValue.SIX:
        matrix[suitIdx][5] = 1;
        break;
      case CardValue.SEVEN:
        matrix[suitIdx][6] = 1;
        break;
      case CardValue.EIGHT:
        matrix[suitIdx][7] = 1;
        break;
      case CardValue.NINE:
        matrix[suitIdx][8] = 1;
        break;
      case CardValue.TEN:
        matrix[suitIdx][9] = 1;
        break;
      case CardValue.JACK:
        matrix[suitIdx][10] = 1;
        break;
      case CardValue.QUEEN:
        matrix[suitIdx][11] = 1;
        break;
      case CardValue.KING:
        matrix[suitIdx][12] = 1;
        break;
      default:
        throw new Error("Invalid card value");
    }
  });

  return matrix;
};

module.exports = {
  HandRank,
  findWinners,
  evaluate,
};
