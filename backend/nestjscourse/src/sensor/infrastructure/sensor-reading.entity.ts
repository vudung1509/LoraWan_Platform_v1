import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('app_sensor_reading')
export class SensorReadingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  devEui: string;

  @Column({ type: 'float', nullable: true, default: null })
  temperature: number;

  @Column({ type: 'float', nullable: true, default: null })
  smoke: number;

  @Column({ type: 'float', nullable: true, default: null })
  humidity: number;

  @Column({ type: 'float', nullable: true, default: null })
  dust: number;

  @Column({ type: 'float', nullable: true, default: null })
  co2: number;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload: any;

  @Index()
  @CreateDateColumn()
  recordedAt: Date;
}
