import { ISensorDecoder } from './sensor-decoder.interface';
import { SensorPayload } from '../sensor-payload.decoder';

export class ChirpStackObjectDecoder implements ISensorDecoder {
  getName(): string {
    return 'CHIRPSTACK_OBJECT';
  }

  decode(chirpstackData: any): SensorPayload {
    const obj = chirpstackData.object || {};
    return {
      temperature: obj.temperature ?? null,
      smoke: obj.smoke ?? null,
      humidity: obj.humidity ?? null,
      dust: obj.dust ?? null,
      co2: obj.co2 ?? null,
    };
  }
}
