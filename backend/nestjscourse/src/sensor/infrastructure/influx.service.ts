import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService implements OnModuleInit {
  private client: InfluxDB;
  private writeApi: WriteApi;
  private queryApi: QueryApi;
  private readonly logger = new Logger(InfluxService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('INFLUX_URL');
    const token = this.configService.get<string>('INFLUX_TOKEN');
    const org = this.configService.get<string>('INFLUX_ORG');
    const bucket = this.configService.get<string>('INFLUX_BUCKET');

    if (!url || !token) {
      this.logger.warn('InfluxDB configuration missing. Time-series storage disabled.');
      return;
    }

    this.client = new InfluxDB({ url, token: token! });
    this.writeApi = this.client.getWriteApi(org!, bucket!, 'ns');
    this.queryApi = this.client.getQueryApi(org!);

    this.logger.log(`InfluxDB initialized at ${url}`);
  }

  getWriteApi(): WriteApi {
    return this.writeApi;
  }

  getQueryApi(): QueryApi {
    return this.queryApi;
  }
}
