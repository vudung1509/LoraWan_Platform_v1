import { Entity, PrimaryColumn, Column, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  UNKNOWN = 'UNKNOWN',
}

@Entity('app_device')
export class DeviceEntity {
  @PrimaryColumn()
  devEui: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.UNKNOWN,
  })
  status: DeviceStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ type: 'integer', default: 3600 }) // Default 60 mins
  timeoutSeconds: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
