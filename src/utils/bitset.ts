export function makeAllTrueBitset(slotCount: number): Buffer {
  const byteCount = Math.ceil(slotCount / 8);
  const buf = Buffer.alloc(byteCount, 0xff); // all bits = 1

  // Clear unused bits in the last byte (if slotCount not divisible by 8)
  const extraBits = byteCount * 8 - slotCount;
  if (extraBits > 0) {
    const validBits = 8 - extraBits;
    const mask = (1 << validBits) - 1; // e.g. validBits=5 => 00011111
    buf[byteCount - 1] &= mask;
  }

  return buf;
}

export function setBit(buf: Buffer, i: number, value: boolean): void {
  const byteIndex = i >> 3;
  const bitIndex = i & 7;
  const mask = 1 << bitIndex;

  if (value) buf[byteIndex] |= mask;   // set to 1
  else buf[byteIndex] &= ~mask;        // set to 0
}

export function getBit(buf: Buffer, i: number): boolean {
  const byteIndex = i >> 3;
  const bitIndex = i & 7;
  const mask = 1 << bitIndex;

  return (buf[byteIndex] & mask) !== 0;
}