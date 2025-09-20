export default class UnitConverter {
  cmToInches(value = 1, decimals = 1) {
    const inches = value * 0.393701;
    return inches.toFixed(decimals);
  }
}
