import { Injectable, Logger } from '@nestjs/common';
import { IDownlinkPort } from '../domain/downlink.port';
import { DeviceCommand } from '../domain/device-command.model';

@Injectable()
export class SendCommandUseCase {
  private readonly logger = new Logger(SendCommandUseCase.name);

  constructor(private readonly downlink: IDownlinkPort) {}

  // Dispatch command to MQTT
  async execute(command: DeviceCommand): Promise<{ status: string; command: string }> {
    this.downlink.send({
      applicationId: command.applicationId,
      devEui: command.devEui,
      confirmed: true,
      fPort: 2,
      data: command.toBase64(),
    });

    this.logger.log(`Dispatched: ${command.commandType} -> ${command.devEui}`);
    return { status: 'dispatched', command: command.commandType };
  }
}
