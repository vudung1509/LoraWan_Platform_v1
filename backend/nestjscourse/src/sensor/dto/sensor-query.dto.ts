import { IsOptional, IsInt, Min, Max, Matches, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SensorQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsString()
  @Matches(/^-[0-9]+[smhdw]$/, { message: 'Range must be like -1h, -24h, -7d' })
  range?: string;
}

export class DevEuiParamDto {
  @IsString()
  @Matches(/^[0-9a-fA-F]{16}$/, { message: 'devEui must be 16 characters hex string' })
  devEui: string;
}
