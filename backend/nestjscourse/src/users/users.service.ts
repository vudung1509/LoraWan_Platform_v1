import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(username: string, passwordPlain: string, role: string = 'user'): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);
    
    const newUser = this.usersRepository.create({ username, passwordHash, role });
    return this.usersRepository.save(newUser);
  }
}
