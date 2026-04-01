import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const validate = await this.validateUser(user.username, user.password);
    if (!validate) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { username: validate.username, sub: validate.id, role: validate.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
