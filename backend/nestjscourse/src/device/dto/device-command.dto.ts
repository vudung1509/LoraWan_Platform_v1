import { IsNotEmpty, IsEnum } from 'class-validator';
import { CommandType } from '../domain/device-command.model';

export class DeviceCommandDto {
  @IsNotEmpty()
  @IsEnum(CommandType)
  command: CommandType;
}
