import { Injectable, Logger } from '@nestjs/common';
import { ProcessUplinkUseCase } from '../sensor/use-cases/process-uplink.use-case';

@Injectable()
export class LorawanService {
  private readonly logger = new Logger(LorawanService.name);

  constructor(private readonly processUplink: ProcessUplinkUseCase) {}

  async handleUplinkEvent(topic: string, payload: Buffer): Promise<void> {
    await this.processUplink.execute(payload);
  }

  handleJoinEvent(topic: string, payload: Buffer): void {
    this.logger.log(`Device joined. Topic: ${topic}`);
  }
}
