import { ISensorDecoder } from './sensor-decoder.interface';
import { SensorPayload } from '../sensor-payload.decoder';

export class LegacyByteDecoder implements ISensorDecoder {
  getName(): string {
    return 'LEGACY_BYTE';
  }

  decode(chirpstackData: any): SensorPayload {
    if (!chirpstackData.data) {
      return { temperature: null, smoke: null, humidity: null };
    }

    try {
      const raw = Buffer.from(chirpstackData.data, 'base64');
      return {
        temperature: raw.readInt16BE(0) / 100,
        smoke: raw.readUInt16BE(2),
        humidity: raw.readUInt16BE(4) / 100,
        dust: null,
        co2: null,
      };
    } catch {
      return { temperature: null, smoke: null, humidity: null };
    }
  }
}
