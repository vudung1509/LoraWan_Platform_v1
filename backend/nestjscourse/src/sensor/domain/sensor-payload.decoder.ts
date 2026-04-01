export interface SensorPayload {
  temperature: number | null;
  smoke: number | null;
  humidity: number | null;
  dust?: number | null;
  co2?: number | null;
}

export function decodeUplinkPayload(chirpstackData: any): SensorPayload {
  if (chirpstackData.object && typeof chirpstackData.object === 'object') {
    const obj = chirpstackData.object;
    return {
      temperature: obj.temperature ?? null,
      smoke: obj.smoke ?? null,
      humidity: obj.humidity ?? null,
      dust: obj.dust ?? null,
      co2: obj.co2 ?? null,
    };
  }

  if (chirpstackData.data) {
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

  return { temperature: null, smoke: null, humidity: null };
}
