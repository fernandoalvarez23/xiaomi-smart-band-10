/**
 * Web Bluetooth service for Xiaomi Smart Band 10.
 *
 * Standard BLE services used:
 *   - Heart Rate:        0x180D / characteristic 0x2A37
 *   - Battery:           0x180F / characteristic 0x2A19
 *   - Immediate Alert:   0x1802 / characteristic 0x2A06 (vibration trigger)
 *   - Device Info:       0x180A
 *
 * Xiaomi proprietary service for step count / activity:
 *   - Mi Band Service:   0xFEE0 / characteristic 0x0007
 */

// ── UUIDs ───────────────────────────────────────────────────────────────────
const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;

const BATTERY_SERVICE = 0x180f;
const BATTERY_LEVEL = 0x2a19;

const IMMEDIATE_ALERT_SERVICE = 0x1802;
const ALERT_LEVEL = 0x2a06;

const DEVICE_INFO_SERVICE = 0x180a;

// Xiaomi proprietary
const MI_BAND_SERVICE = 0xfee0;

// ── Types ───────────────────────────────────────────────────────────────────
export interface BandData {
  heartRate: number | null;
  battery: number | null;
  steps: number | null;
  deviceName: string;
  connected: boolean;
}

export type BandEventType = 'data' | 'connection' | 'error';
type Listener = (data: BandData) => void;

// ── Service ─────────────────────────────────────────────────────────────────
class BLEService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private listeners = new Set<Listener>();
  private pollingTimer: ReturnType<typeof setInterval> | null = null;

  private data: BandData = {
    heartRate: null,
    battery: null,
    steps: null,
    deviceName: '',
    connected: false,
  };

  // ── public API ──────────────────────────────────────────────────────────
  get currentData(): Readonly<BandData> {
    return { ...this.data };
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth is not supported in this browser.');
    }

    // Request device – accept both official names and the generic Mi Band service
    this.device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'Xiaomi Smart Band' },
        { namePrefix: 'Mi Smart Band' },
        { namePrefix: 'Mi Band' },
        { services: [MI_BAND_SERVICE] },
      ],
      optionalServices: [
        HEART_RATE_SERVICE,
        BATTERY_SERVICE,
        IMMEDIATE_ALERT_SERVICE,
        DEVICE_INFO_SERVICE,
        MI_BAND_SERVICE,
      ],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      this.handleDisconnect();
    });

    this.server = await this.device.gatt!.connect();
    this.data.deviceName = this.device.name ?? 'Smart Band 10';
    this.data.connected = true;
    this.emit();

    // Start monitoring
    await this.startHeartRateNotifications();
    await this.readBattery();
    await this.readSteps();

    // Poll battery & steps every 30s
    this.pollingTimer = setInterval(async () => {
      try {
        await this.readBattery();
        await this.readSteps();
      } catch {
        // ignore transient read errors
      }
    }, 30_000);
  }

  async disconnect(): Promise<void> {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = null;
    this.device?.gatt?.disconnect();
    this.handleDisconnect();
  }

  /** Send an immediate alert to make the band vibrate. Level 0=off, 1=mild, 2=high */
  async vibrate(level: 0 | 1 | 2 = 2): Promise<void> {
    if (!this.server?.connected) throw new Error('Not connected');
    try {
      const service = await this.server.getPrimaryService(IMMEDIATE_ALERT_SERVICE);
      const char = await service.getCharacteristic(ALERT_LEVEL);
      await char.writeValue(new Uint8Array([level]));
    } catch (err) {
      console.warn('Vibrate failed (service may not be available):', err);
      throw err;
    }
  }

  /** Start a countdown timer that vibrates the band when done */
  startTimer(seconds: number, onTick: (remaining: number) => void): () => void {
    let remaining = seconds;
    const id = setInterval(() => {
      remaining--;
      onTick(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        this.vibrate(2).catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
  }

  // ── internal ────────────────────────────────────────────────────────────
  private async startHeartRateNotifications() {
    try {
      const service = await this.server!.getPrimaryService(HEART_RATE_SERVICE);
      const char = await service.getCharacteristic(HEART_RATE_MEASUREMENT);
      char.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
        // HR measurement format: flags byte + HR value (8-bit or 16-bit)
        const flags = value.getUint8(0);
        this.data.heartRate = flags & 0x01
          ? value.getUint16(1, true)
          : value.getUint8(1);
        this.emit();
      });
      await char.startNotifications();
    } catch (err) {
      console.warn('Heart rate service not available:', err);
    }
  }

  private async readBattery() {
    try {
      const service = await this.server!.getPrimaryService(BATTERY_SERVICE);
      const char = await service.getCharacteristic(BATTERY_LEVEL);
      const value = await char.readValue();
      this.data.battery = value.getUint8(0);
      this.emit();
    } catch (err) {
      console.warn('Battery service not available:', err);
    }
  }

  private async readSteps() {
    try {
      const service = await this.server!.getPrimaryService(MI_BAND_SERVICE);
      const chars = await service.getCharacteristics();
      // The step count is typically in the first readable characteristic (0x0007)
      for (const char of chars) {
        try {
          const value = await char.readValue();
          if (value.byteLength >= 2) {
            // Step count is usually a little-endian uint16/uint32 starting at offset 1
            this.data.steps = value.byteLength >= 5
              ? value.getUint32(1, true)
              : value.getUint16(1, true);
            this.emit();
            break;
          }
        } catch {
          // characteristic not readable – try next
        }
      }
    } catch (err) {
      console.warn('Step count service not available:', err);
    }
  }

  private handleDisconnect() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    this.pollingTimer = null;
    this.data.connected = false;
    this.data.heartRate = null;
    this.emit();
  }

  private emit() {
    const snapshot = { ...this.data };
    this.listeners.forEach((fn) => fn(snapshot));
  }
}

export const bleService = new BLEService();
