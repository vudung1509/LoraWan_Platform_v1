import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(
        createUserDto.username, 
        createUserDto.password, 
        createUserDto.email
      );
      return { message: 'User created successfully', id: user.id };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('Tên đăng nhập hoặc Email đã tồn tại!');
      }
      throw error;
    }
  }
}
