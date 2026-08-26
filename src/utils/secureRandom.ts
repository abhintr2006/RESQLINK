/**
 * Bias-free cryptographically secure random number utilities.
 *
 * Why not `rand / 2^32 * N`?
 * A Uint32 has 2^32 possible values. If N does not evenly divide 2^32, some
 * outputs are more likely than others (modulo bias / CWE-338 variant flagged
 * by CodeQL rule `js/biased-cryptographic-random`).
 *
 * These helpers use rejection sampling and the 53-bit mantissa trick to
 * eliminate that bias entirely.
 */

/**
 * Returns a cryptographically secure, unbiased integer in [0, max).
 * Uses rejection sampling to eliminate modulo bias.
 *
 * @param max - Exclusive upper bound (must be a positive integer <= 2^32)
 */
export function secureRandomInt(max: number): number {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new RangeError('max must be a positive integer');
  }
  // Largest multiple of `max` that fits in a Uint32 — values at or above this
  // threshold are discarded to guarantee a perfectly uniform distribution.
  const limit = 2 ** 32 - (2 ** 32 % max);
  const buf = new Uint32Array(1);
  let r: number;
  do {
    crypto.getRandomValues(buf);
    r = buf[0];
  } while (r >= limit);
  return r % max;
}

/**
 * Returns a cryptographically secure float uniformly distributed in [0, 1).
 *
 * Uses two Uint32 values to fill all 53 significant bits of a JavaScript
 * double, matching the precision of Math.random() without any modulo bias.
 */
export function secureRandomFloat(): number {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  // Combine high 21 bits from buf[0] and all 32 bits from buf[1]
  // to form a 53-bit integer, then scale to [0, 1).
  const hi = buf[0] >>> 11; // 21 bits
  const lo = buf[1];        // 32 bits
  return (hi * 4294967296 + lo) / (2 ** 53);
}
