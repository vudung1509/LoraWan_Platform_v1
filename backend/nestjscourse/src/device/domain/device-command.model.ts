export enum CommandType {
  ACTIVATE_SPRINKLER = 'ACTIVATE_SPRINKLER',
  SILENCE_ALARM = 'SILENCE_ALARM',
  TEST_ALARM = 'TEST_ALARM',
  EVACUATE = 'EVACUATE',
}

export class DeviceCommand {
  readonly devEui: string;
  readonly commandType: CommandType;
  readonly applicationId: string;

  constructor(devEui: string, commandType: CommandType, applicationId = '1') {
    this.devEui = devEui;
    this.commandType = commandType;
    this.applicationId = applicationId;
  }

  toBase64(): string {
    return Buffer.from(this.commandType).toString('base64');
  }
}
