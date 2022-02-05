import { CardSuit, CardValue } from "./card";

// eslint-disable-next-line no-extend-native
Array.prototype.count = function (filter) {
  let count = 0;
  for (let i = 0; i < this.length; i++) {
    if (filter(this[i])) count++;
  }
  return count;
};

export function evaluate(hand, board) {
  const result = evalutateRaw(hand, board);
  let sortedHand = [...hand];
  if (valueToIndex(hand[0].value) < valueToIndex(hand[1].value))
    sortedHand.reverse();
  const wrappedResult = {
    ...result,
    strength:
      HandRank[result.type] * 100000000 +
      result.strength * 1000000 +
      (valueToIndex(sortedHand[0].value) + 1) * 100 +
      (valueToIndex(sortedHand[1].value) + 1),
  };
  return wrappedResult;
}

export function evalutateRaw(hand, board) {
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
  }
  if (straightFlush >= 0) {
    const result = {
      type: "straight flush",
      strength: straightFlush + 1,
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
  if (fourOfAKind >= 0) {
    const result = {
      type: "four of a kind",
      strength: fourOfAKind + 1,
      cards: fourOfAKindCards,
    };
    return result;
  }

  // check for full house
  let fullHouse = -1;
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
  if (threeOfAKind >= 0) {
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
    if (pairOtherThanThreeOfAKind >= 0) {
      fullHouse = threeOfAKind + 1 + (pairOtherThanThreeOfAKind + 1) * 0.01;
      const result = {
        type: "full house",
        strength: fullHouse,
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
        score += i + 1;
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
      strength: flush,
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
  if (straight >= 0) {
    const result = {
      type: "straight",
      strength: straight + 1,
      cards: straightCards,
    };
    return result;
  }

  // check for three of a kind
  if (threeOfAKind >= 0) {
    const result = {
      type: "three of a kind",
      strength: threeOfAKind + 1,
      cards: threeOfAKindCards,
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
  if (highPair >= 0) {
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
    if (secondPair >= 0) {
      const result = {
        type: "two pair",
        strength: highPair + 1 + (secondPair + 1) * 0.01,
        cards: [...highPairCards, ...secondPairCards],
      };
      return result;
    }
  }

  // check for pair
  if (highPair >= 0) {
    const result = {
      type: "pair",
      strength: highPair + 1,
      cards: highPairCards,
    };
    return result;
  }

  // check for high card
  let highCard = -1;
  let highCardCards = [];
  for (let i = matrix[0].length - 1; i > 0; i--) {
    for (let j = 0; j < matrix.length; j++) {
      if (matrix[j][i] === 1) {
        highCard = i;
        highCardCards.push(getCard(j, i));
        break;
      }
    }
    if (highCard >= 0) {
      break;
    }
  }
  if (highCard >= 0) {
    const result = {
      type: "high card",
      strength: highCard + 1,
      cards: highCardCards,
    };
    return result;
  }

  return {
    type: "no hand",
    strength: 0,
    cards: [],
  };
}

export const HandRank = {
  "no hand": 0,
  "high card": 1,
  "pair": 2,
  "two pair": 3,
  "three of a kind": 4,
  "straight": 5,
  "flush": 6,
  "full house": 7,
  "four of a kind": 8,
  "straight flush": 9,
};

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
