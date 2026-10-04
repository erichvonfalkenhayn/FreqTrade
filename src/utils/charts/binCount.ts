export function binData(data: number[], bins: number) {
  if (!Array.isArray(data) || data.length === 0 || !Number.isFinite(bins) || bins <= 0) {
    return [];
  }

  const minimum = Math.min(...data);
  const maximum = Math.max(...data);

  // Count occurrences as an array with [bucketStart, count in this bucket]
  const baseBins = [...Array(bins).keys()].map((i) => [
    Math.round((minimum + (i * ((maximum - minimum) * 1.01)) / bins) * 1000) / 1000,
    0,
  ]);

  // Handle constant / degenerate ranges without dividing by zero.
  if (minimum === maximum) {
    baseBins[0]![1] = data.length;
    return baseBins;
  }

  const binSize = ((maximum - minimum) * 1.01) / bins;
  for (let i = 0; i < data.length; i++) {
    const index = Math.min(Math.floor((data[i]! - minimum) / binSize), bins - 1);
    if (!Number.isNaN(index)) {
      baseBins[index]![1]!++;
    }
  }

  return baseBins;
}
