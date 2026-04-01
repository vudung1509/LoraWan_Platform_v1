import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('app_alert')
export class AlertEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  devEui: string;

  @Column()
  alertType: string;

  @Column({ type: 'float', nullable: true, default: null })
  temperature: number;

  @Column({ type: 'float', nullable: true, default: null })
  smoke: number;

  @CreateDateColumn()
  triggeredAt: Date;
}
