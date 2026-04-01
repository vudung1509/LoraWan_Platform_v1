import { Processor } from '@nestjs/bullmq';
import { UplinkProcessor } from './uplink.processor';

@Processor('uplink-priority', { concurrency: 10 })
export class PriorityUplinkProcessor extends UplinkProcessor {}
