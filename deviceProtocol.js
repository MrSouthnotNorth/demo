/**
 * deviceProtocol.js
 * Giao thức đọc/ghi phần cứng chính xác cho TANCHJIM BUNNY FOR GAMING
 * VID: 0x3302 | PID: 0xC226 | ReportID: 0x4B (75) | Firmware: Walkplay 0.1
 */

import { encodeBiquadToQ30Bytes } from './dspMath.js';

const REPORT_ID = 0x4b; // 75

export class TanchjimBunnyController {
  constructor(logger = console.log) {
    this.device = null;
    this.log = logger;
    this.onDisconnectCallback = null;
    this.onHardwareBandsRead = null;
    this._pulledBands = new Map();
    this._currentSlot = 101; // Slot mặc định của BUNNY FOR GAMING (0x65)
    this._isWriting = false;
  }

  async connect() {
    if (!('hid' in navigator)) {
      throw new Error('Trình duyệt không hỗ trợ WebHID. Hãy dùng Google Chrome trên macOS.');
    }

    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: 0x3302 }],
    });

    if (!devices || devices.length === 0) return null;

    // Chọn đúng HID Interface chứa ReportID 0x4B
    const dspInterface = devices.find((d) =>
      d.collections.some(
        (c) =>
          (c.outputReports && c.outputReports.some((r) => r.reportId === REPORT_ID)) ||
          (c.inputReports && c.inputReports.some((r) => r.reportId === REPORT_ID))
      )
    );

    this.device = dspInterface || devices[0];

    if (!this.device.opened) {
      await this.device.open();
    }

    this.log(
      `[HID] Đã kết nối: ${this.device.productName} (VID: 0x${this.device.vendorId.toString(16)}, PID: 0x${this.device.productId.toString(16)})`
    );

    // Lắng nghe dữ liệu phản hồi từ chip DSP
    this.device.addEventListener('inputreport', (event) => this._handleInputReport(event));

    navigator.hid.addEventListener('disconnect', (event) => {
      if (event.device === this.device) {
        this.device = null;
        this.log('[HID] Tai nghe Bunny Gaming đã ngắt kết nối.');
        if (this.onDisconnectCallback) this.onDisconnectCallback();
      }
    });

    // Tự động đọc toàn bộ EQ đang lưu sẵn trong tai nghe
    await this.pullBandsFromDevice();

    return {
      productName: this.device.productName || 'BUNNY FOR GAMING',
      vendorId: this.device.vendorId,
      productId: this.device.productId,
    };
  }

  isConnected() {
    return Boolean(this.device && this.device.opened);
  }

  /**
   * Đọc EQ Slot và toàn bộ 8 Band đang lưu trong chip DSP của Bunny Gaming
   */
  async pullBandsFromDevice() {
    if (!this.isConnected()) return;
    this._pulledBands.clear();
    this.log('[READ] Đang đọc dữ liệu EQ có sẵn từ tai nghe Bunny...');

    await this._sendRaw([0x80, 0x0c, 0x00]); // Kiểm tra Firmware
    await this._sleep(25);
    await this._sendRaw([0x80, 0x09, 0x00]); // Đọc EQ Slot hiện tại
    await this._sleep(25);

    // Gửi lệnh 6-byte [0x80, 0x09, 0x00, 0x00, i, 0x00] để đọc từng Band (0 -> 7)
    for (let i = 0; i < 8; i++) {
      await this._sendRaw([0x80, 0x09, 0x00, 0x00, i, 0x00]);
      await this._sleep(20);
    }

    await this._sendRaw([0x80, 0x03, 0x00]); // Đọc Global Gain
  }

  /**
   * Giải mã chính xác gói 63-byte trả về từ Bunny Gaming
   * Cấu trúc RX:
   * [0..5]  : 80 09 00 00 [bandIdx] 00
   * [6]     : 0xFF
   * [7..26] : 20 bytes Biquad Q30
   * [27..28]: Freq (Uint16 LE)
   * [29..30]: Q * 256 (Uint16 LE - Q8.8)
   * [31..32]: Gain * 256 (Int16 LE - Q8.8)
   * [33..34]: Type (02 00 = Peak)
   * [35..36]: Current Slot ID (VD: 65 00 = 101)
   */
  _handleInputReport(event) {
    const bytes = new Uint8Array(event.data.buffer);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

    // Gói trả về thông tin Slot (80 09 00 30 2e 31 ...)
    if (bytes[0] === 0x80 && bytes[1] === 0x09 && bytes[3] === 0x30) {
      const slot = view.getUint16(35, true);
      if (slot > 0) this._currentSlot = slot;
      this.log(`[INFO] Firmware 0.1 | EQ Slot hiện tại: ${this._currentSlot}`);
      return;
    }

    // Gói trả về dữ liệu từng Band (80 09 00 00 [bandIdx] 00 ...)
    if (bytes[0] === 0x80 && bytes[1] === 0x09 && bytes[3] === 0x00 && bytes[4] < 8 && bytes.length >= 37) {
      const bandIdx = bytes[4];
      const freq = view.getUint16(27, true);
      const qRaw = view.getUint16(29, true);
      const gainRaw = view.getInt16(31, true);
      const slot = view.getUint16(35, true);
      if (slot > 0) this._currentSlot = slot;

      const parsedBand = {
        enabled: true,
        type: 'PK',
        freq: freq >= 20 && freq <= 20000 ? freq : 100,
        q: Math.max(0.1, Math.min(15, Math.round((qRaw / 256) * 100) / 100 || 1.0)),
        gain: Math.max(-10, Math.min(10, Math.round((gainRaw / 256) * 10) / 10)),
      };

      this._pulledBands.set(bandIdx, parsedBand);
      this.log(
        `[READ Band #${bandIdx + 1}] Freq=${parsedBand.freq}Hz | Gain=${parsedBand.gain > 0 ? '+' : ''}${parsedBand.gain}dB | Q=${parsedBand.q}`
      );

      if (this._pulledBands.size === 8 && this.onHardwareBandsRead) {
        const ordered = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => this._pulledBands.get(idx));
        this.log('[SYNC] Đã nạp toàn bộ 8 Band EQ từ tai nghe lên biểu đồ!');
        this.onHardwareBandsRead(ordered);
      }
    }
  }

  /**
   * Đóng gói 1 Band thành gói 37 bytes khớp 100% với log Walkplay
   * [0..4]  : 01 09 18 00 [bandIndex]
   * [5..6]  : 00 00
   * [7..26] : 20 bytes Biquad Q30 (b0, b1, b2, -a1, -a2)
   * [27..28]: Freq (Uint16 LE)
   * [29..30]: Q * 256 (Uint16 LE - Q8.8)
   * [31..32]: Gain * 256 (Int16 LE - Q8.8)
   * [33..34]: 02 00 (Peak Filter)
   * [35..36]: Slot ID (Uint16 LE, mặc định 101 = 0x65)
   */
  buildBand37BytePacket(bandIndex, band) {
    const packet = new Uint8Array(37);
    const view = new DataView(packet.buffer);

    packet[0] = 0x01;
    packet[1] = 0x09;
    packet[2] = 0x18;
    packet[3] = 0x00;
    packet[4] = bandIndex & 0xff;
    packet[5] = 0x00;
    packet[6] = 0x00;

    const freq = Math.max(20, Math.min(20000, Math.round(band.freq)));
    const gain = Math.max(-10, Math.min(10, band.enabled ? band.gain : 0));
    const q = Math.max(0.1, Math.min(15, band.q));

    // Ghi 20 bytes Biquad Q30 bắt đầu từ offset 7
    const biquadBytes = encodeBiquadToQ30Bytes(freq, gain, q, band.enabled);
    packet.set(biquadBytes, 7);

    // Ghi metadata chuẩn Q8.8 từ offset 27
    view.setUint16(27, freq, true);
    view.setUint16(29, Math.round(q * 256), true);
    view.setInt16(31, Math.round(gain * 256), true);
    view.setUint16(33, 0x0002, true);
    view.setUint16(35, this._currentSlot, true);

    return packet;
  }

  /**
   * Ghi đè 8 Band xuống chip DSP của Bunny Gaming và lưu vào Flash
   */
  async writeAndSaveBands(bands) {
    if (!this.isConnected()) {
      throw new Error('Chưa kết nối với BUNNY FOR GAMING!');
    }
    if (this._isWriting) return false;
    this._isWriting = true;

    try {
      for (let i = 0; i < 8; i++) {
        const band = bands[i] || { enabled: true, freq: 100, gain: 0, q: 1.0 };
        const payload = this.buildBand37BytePacket(i, band);
        await this.device.sendReport(REPORT_ID, payload);
        await this._sleep(15);
      }

      // Chuỗi lệnh kích hoạt âm thanh & lưu Flash của Walkplay
      await this._sendRaw([0x01, 0x03, 0x02, 0x00, 0x00]); // Global Gain = 0 dB
      await this._sleep(15);
      await this._sendRaw([0x01, 0x05, 0x00]);             // Apply EQ
      await this._sleep(15);
      await this._sendRaw([0x01, 0x17, 0x00]);             // Refresh DSP
      await this._sleep(15);
      await this._sendRaw([0x01, 0x0a, 0x04, 0x00, 0x00, 0xff, 0xff, 0x00]); // Commit Flash
      await this._sleep(15);
      await this._sendRaw([0x01, 0x01, 0x01, 0x00]);       // Finalize

      this.log(`[WRITE] Đã ghi đè và lưu 8 Band vào Slot ${this._currentSlot} của Bunny Gaming.`);
      return true;
    } finally {
      this._isWriting = false;
    }
  }

  async _sendRaw(byteArray) {
    await this.device.sendReport(REPORT_ID, new Uint8Array(byteArray));
  }

  _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
