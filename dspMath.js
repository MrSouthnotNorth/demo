/**
 * dspMath.js
 * Tính toán đáp tuyến tần số & xuất hệ số Biquad Fixed-Point Q2.30
 * Khớp chính xác 100% với firmware Walkplay 0.1 trên BUNNY FOR GAMING.
 */

export const SAMPLE_RATE = 48000;

export function calculateBiquadCoefficients(freq, gain, q, fs = SAMPLE_RATE) {
  const f0 = Math.max(20, Math.min(freq, fs / 2 - 100));
  const Q = Math.max(0.1, Math.min(q, 20));
  const A = Math.pow(10, gain / 40);
  const w0 = (2 * Math.PI * f0) / fs;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);

  // Peaking EQ chuẩn Audio EQ Cookbook
  const b0 = 1 + alpha * A;
  const b1 = -2 * cosW0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha / A;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0,
  };
}

/**
 * Xuất 20 bytes Biquad Q2.30 (Int32 Little-Endian)
 * Luôn tính đủ 5 hệ số [b0, b1, b2, -a1, -a2] * 2^30 kể cả khi gain = 0
 * để khớp chính xác với firmware Walkplay.
 */
export function encodeBiquadToQ30Bytes(freq, gain, q, enabled = true) {
  const buffer = new ArrayBuffer(20);
  const view = new DataView(buffer);
  const SCALE_Q30 = 1073741824; // 2^30 = 0x40000000

  const effectiveGain = enabled ? gain : 0;
  const c = calculateBiquadCoefficients(freq, effectiveGain, q);

  const toQ30 = (val) => {
    const scaled = Math.round(val * SCALE_Q30);
    return Math.max(-2147483647, Math.min(2147483647, scaled));
  };

  view.setInt32(0, toQ30(c.b0), true);
  view.setInt32(4, toQ30(c.b1), true);
  view.setInt32(8, toQ30(c.b2), true);
  view.setInt32(12, toQ30(-c.a1), true);
  view.setInt32(16, toQ30(-c.a2), true);

  return new Uint8Array(buffer);
}

export function getBiquadMagnitudeDb(coeffs, freq, fs = SAMPLE_RATE) {
  const { b0, b1, b2, a1, a2 } = coeffs;
  const w = (2 * Math.PI * freq) / fs;
  const cosW = Math.cos(w);
  const cos2W = Math.cos(2 * w);

  const numerator =
    b0 * b0 + b1 * b1 + b2 * b2 +
    2 * (b0 * b1 + b1 * b2) * cosW +
    2 * (b0 * b2) * cos2W;

  const denominator =
    1 + a1 * a1 + a2 * a2 +
    2 * (a1 + a1 * a2) * cosW +
    2 * a2 * cos2W;

  const magnitudeSquared = Math.max(1e-12, numerator / denominator);
  return 10 * Math.log10(magnitudeSquared);
}

export function calculateTotalResponse(bands, freqPoints) {
  const activeCoeffs = bands
    .filter((b) => b.enabled && Math.abs(b.gain) > 0.001)
    .map((b) => calculateBiquadCoefficients(b.freq, b.gain, b.q));

  return freqPoints.map((freq) => {
    let totalDb = 0;
    for (let i = 0; i < activeCoeffs.length; i++) {
      totalDb += getBiquadMagnitudeDb(activeCoeffs[i], freq);
    }
    return totalDb;
  });
}
