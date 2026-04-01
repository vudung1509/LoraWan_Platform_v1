import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { LorawanService } from '../lorawan/lorawan.service';
import { IDownlinkPort, DownlinkPayload } from '../device/domain/downlink.port';
import { ProcessUplinkUseCase } from '../sensor/use-cases/process-uplink.use-case';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy, IDownlinkPort {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(
    @Inject(forwardRef(() => LorawanService))
    private readonly lorawanService: LorawanService,
    private readonly processUplink: ProcessUplinkUseCase,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const url = this.configService.get<string>('MQTT_URL', 'mqtt://127.0.0.1:1883');
    const username = this.configService.get<string>('MQTT_USERNAME');
    const password = this.configService.get<string>('MQTT_PASSWORD');

    this.client = mqtt.connect(url, {
      protocolVersion: 4,
      username,
      password,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT Broker');
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, payload) => {
      this.handleMessage(topic, payload.toString());
    });

    this.client.on('error', err => {
      this.logger.error(`MQTT Error: ${err.message}`);
    });
  }

  private subscribeToTopics() {
    const topics = [
      'application/+/device/+/event/up',
      'application/+/device/+/event/join',
      'application/+/device/+/event/ack',
    ];

    this.client.subscribe(topics, (err, granted) => {
      if (!err) {
        granted?.forEach(g => this.logger.log(`Subscribed to: ${g.topic}`));
      }
    });
  }

  private async handleMessage(topic: string, message: string) {
    try {
      const data = JSON.parse(message);
      if (topic.endsWith('/up')) {
        await this.processUplink.execute(data);
      }
    } catch (error) {
      this.logger.error('Error handling MQTT message', error.stack);
    }
  }

  send(payload: DownlinkPayload): void {
    const topic = `application/${payload.applicationId}/device/${payload.devEui}/command/down`;
    const body = JSON.stringify({
      confirmed: payload.confirmed,
      fPort: payload.fPort,
      data: payload.data,
    });
    
    this.client.publish(topic, body, { qos: 1 }, err => {
      if (!err) {
        this.logger.log(`Downlink sent to ${payload.devEui}`);
      }
    });
  }

  onModuleDestroy() {
    this.client?.end();
  }
}
