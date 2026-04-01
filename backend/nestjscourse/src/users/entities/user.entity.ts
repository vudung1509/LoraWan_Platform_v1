import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
