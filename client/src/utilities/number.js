export function lerp(a, b, fraction) {
  return a + (b-a) * fraction;
}

export function monetary(number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(number);
};