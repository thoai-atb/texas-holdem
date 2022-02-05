export function indexFromPosition(position, seatIndex) {
  return (seatIndex + position) % 9;
}

export function positionFromIndex(index, seatIndex) {
  return (index - seatIndex + 9) % 9;
}
