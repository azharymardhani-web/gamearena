// Multi-Transport Real-Time Arena Bridge for MTs Negeri 14 Jakarta Timur (Kampus Halim)
// Combines:
// 1. BroadcastChannel (0.1ms instant sync across tabs in the same browser)
// 2. Dual Global MQTT-over-WebSocket Relays (bridges ais-dev <-> ais-pre & multi-instance Cloud Run across phones/laptops)

export interface ArenaSyncPacket {
  packetId?: string;
  originTabId?: string;
  type:
    | 'arena:hello'
    | 'player:moved'
    | 'player:left'
    | 'chat:message'
    | 'versus:update'
    | 'teacher:answer'
    | 'room:status';
  payload: any;
}

const ARENA_TOPIC = 'mtsn14-halim-2d55d160/arena/v4';
const BROKER_URLS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

function encodeVarLen(len: number): Uint8Array {
  const bytes: number[] = [];
  let rem = len;
  do {
    let encoded = rem % 128;
    rem = Math.floor(rem / 128);
    if (rem > 0) encoded = encoded | 128;
    bytes.push(encoded);
  } while (rem > 0);
  return new Uint8Array(bytes);
}

function concatUint8(arrays: Uint8Array[]): Uint8Array<ArrayBuffer> {
  let total = 0;
  for (const a of arrays) total += a.length;
  const buf = new ArrayBuffer(total);
  const out = new Uint8Array(buf);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function buildMqttConnectPacket(clientId: string): Uint8Array<ArrayBuffer> {
  const idBytes = textEncoder.encode(clientId);
  const vh = new Uint8Array([0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c]);
  const lenPrefix = new Uint8Array([(idBytes.length >> 8) & 0xff, idBytes.length & 0xff]);
  const remLen = encodeVarLen(vh.length + lenPrefix.length + idBytes.length);
  return concatUint8([new Uint8Array([0x10]), remLen, vh, lenPrefix, idBytes]);
}

function buildMqttSubscribePacket(topic: string): Uint8Array<ArrayBuffer> {
  const tBytes = textEncoder.encode(topic);
  const body = concatUint8([
    new Uint8Array([0x00, 0x01]),
    new Uint8Array([(tBytes.length >> 8) & 0xff, tBytes.length & 0xff]),
    tBytes,
    new Uint8Array([0x00]),
  ]);
  return concatUint8([new Uint8Array([0x82]), encodeVarLen(body.length), body]);
}

function buildMqttPublishPacket(topic: string, jsonStr: string): Uint8Array<ArrayBuffer> {
  const tBytes = textEncoder.encode(topic);
  const mBytes = textEncoder.encode(jsonStr);
  const body = concatUint8([
    new Uint8Array([(tBytes.length >> 8) & 0xff, tBytes.length & 0xff]),
    tBytes,
    mBytes,
  ]);
  return concatUint8([new Uint8Array([0x30]), encodeVarLen(body.length), body]);
}

const MQTT_PINGREQ = new Uint8Array([0xc0, 0x00]);

export class CloudArenaBridge {
  public readonly tabRuntimeId: string;
  private listeners = new Set<(pkt: ArenaSyncPacket) => void>();
  private seenPacketIds = new Set<string>();
  private bc: BroadcastChannel | null = null;
  private sockets: WebSocket[] = [];
  private pingTimers: Array<ReturnType<typeof setInterval>> = [];
  private reconnectTimers: Array<ReturnType<typeof setTimeout>> = [];
  private disposed = false;

  constructor() {
    this.tabRuntimeId = `tab-${Date.now().toString(36).slice(-4)}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.bc = new BroadcastChannel('mtsn14_halim_arena_bus_v4');
        this.bc.onmessage = (ev) => {
          if (ev?.data) {
            this.handleIncomingRaw(ev.data);
          }
        };
      } catch {
        // Ignore BroadcastChannel errors on restricted browsers
      }
    }

    if (typeof window !== 'undefined') {
      BROKER_URLS.forEach((url, idx) => {
        this.connectBroker(url, idx);
      });
    }
  }

  private connectBroker(url: string, idx: number) {
    if (this.disposed) return;
    try {
      const ws = new WebSocket(url, ['mqtt']);
      ws.binaryType = 'arraybuffer';
      this.sockets[idx] = ws;

      ws.onopen = () => {
        if (this.disposed) {
          ws.close();
          return;
        }
        const clientId = `mts14-${this.tabRuntimeId}-${idx}`;
        ws.send(buildMqttConnectPacket(clientId));
        ws.send(buildMqttSubscribePacket(ARENA_TOPIC));

        if (this.pingTimers[idx]) clearInterval(this.pingTimers[idx]);
        this.pingTimers[idx] = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(MQTT_PINGREQ);
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (!(event.data instanceof ArrayBuffer)) return;
        const buf = new Uint8Array(event.data);
        let offset = 0;
        while (offset < buf.length) {
          const header = buf[offset++];
          let mult = 1;
          let remLen = 0;
          let b = 0;
          do {
            if (offset >= buf.length) return;
            b = buf[offset++];
            remLen += (b & 127) * mult;
            mult *= 128;
          } while ((b & 128) !== 0);

          const packetEnd = offset + remLen;
          if (packetEnd > buf.length) return;

          const packetType = header >> 4;
          if (packetType === 3) {
            const tLen = (buf[offset] << 8) | buf[offset + 1];
            const payloadStart = offset + 2 + tLen;
            if (payloadStart <= packetEnd) {
              const jsonStr = textDecoder.decode(buf.subarray(payloadStart, packetEnd));
              try {
                const parsed = JSON.parse(jsonStr);
                this.handleIncomingRaw(parsed);
              } catch {
                // Ignore malformed JSON
              }
            }
          }
          offset = packetEnd;
        }
      };

      ws.onclose = () => {
        if (this.pingTimers[idx]) clearInterval(this.pingTimers[idx]);
        if (!this.disposed) {
          this.reconnectTimers[idx] = setTimeout(() => this.connectBroker(url, idx), 2500);
        }
      };

      ws.onerror = () => {
        // Error handled by onclose reconnect
      };
    } catch {
      // Ignore connection setup error
    }
  }

  private handleIncomingRaw(pkt: ArenaSyncPacket) {
    if (!pkt || !pkt.type) return;
    if (pkt.originTabId === this.tabRuntimeId) return;
    if (pkt.packetId) {
      if (this.seenPacketIds.has(pkt.packetId)) return;
      this.seenPacketIds.add(pkt.packetId);
      if (this.seenPacketIds.size > 800) {
        const first = this.seenPacketIds.values().next().value;
        if (first) this.seenPacketIds.delete(first);
      }
    }
    for (const cb of this.listeners) {
      cb(pkt);
    }
  }

  public publish(type: ArenaSyncPacket['type'], payload: any) {
    const pkt: ArenaSyncPacket = {
      packetId: `${this.tabRuntimeId}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      originTabId: this.tabRuntimeId,
      type,
      payload,
    };

    this.seenPacketIds.add(pkt.packetId!);

    // 1. Instant local BroadcastChannel to other tabs in the same browser
    try {
      this.bc?.postMessage(pkt);
    } catch {
      // Ignore
    }

    // 2. Global MQTT-over-WebSocket relay across containers & devices
    const encoded = buildMqttPublishPacket(ARENA_TOPIC, JSON.stringify(pkt));
    for (const ws of this.sockets) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(encoded);
        } catch {
          // Ignore send error
        }
      }
    }
  }

  public subscribe(cb: (pkt: ArenaSyncPacket) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public dispose() {
    this.disposed = true;
    this.bc?.close();
    for (const t of this.pingTimers) clearInterval(t);
    for (const t of this.reconnectTimers) clearTimeout(t);
    for (const ws of this.sockets) {
      try {
        ws?.close();
      } catch {
        // Ignore
      }
    }
  }
}
