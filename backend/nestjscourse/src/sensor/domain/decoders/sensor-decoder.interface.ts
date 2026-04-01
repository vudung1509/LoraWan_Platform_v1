import { SensorPayload } from '../sensor-payload.decoder';

export interface ISensorDecoder {
  decode(chirpstackData: any): SensorPayload;
  getName(): string;
}
