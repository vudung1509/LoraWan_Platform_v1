import { Injectable, Logger } from '@nestjs/common';
import { ISensorDecoder } from './decoders/sensor-decoder.interface';
import { ChirpStackObjectDecoder } from './decoders/chirpstack-object.decoder';
import { LegacyByteDecoder } from './decoders/legacy-byte.decoder';
import { SensorPayload } from './sensor-payload.decoder';

@Injectable()
export class DecoderRegistry {
  private readonly logger = new Logger(DecoderRegistry.name);
  private decoders: Map<string, ISensorDecoder> = new Map();

  constructor() {
    this.register(new ChirpStackObjectDecoder());
    this.register(new LegacyByteDecoder());
  }

  register(decoder: ISensorDecoder) {
    this.decoders.set(decoder.getName(), decoder);
    this.logger.log(`Registered decoder: ${decoder.getName()}`);
  }

  decode(chirpstackData: any): SensorPayload {
    if (chirpstackData.object && Object.keys(chirpstackData.object).length > 0) {
      return this.getDecoder('CHIRPSTACK_OBJECT').decode(chirpstackData);
    }
    return this.getDecoder('LEGACY_BYTE').decode(chirpstackData);
  }

  private getDecoder(name: string): ISensorDecoder {
    const decoder = this.decoders.get(name);
    if (!decoder) throw new Error(`Decoder [${name}] not found`);
    return decoder;
  }
}
