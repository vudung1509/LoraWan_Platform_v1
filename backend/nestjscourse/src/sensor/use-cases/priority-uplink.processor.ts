import { Processor } from '@nestjs/bullmq';
import { UplinkProcessor } from './uplink.processor';

@Processor('uplink-priority')
export class PriorityUplinkProcessor extends UplinkProcessor {}
