import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser({ username, email, password }: CreateUserDto) {
    try {
      // Assuming 'User' is the Prisma model for users
      const User = await this.prismaService.user.create({
        data: {
          username,
          email,
          password,
        },
      });
      return User;
    } catch (error) {
      // Handle errors, for example, duplicate email or username
      throw new BadRequestException('User creation failed');
    }
  }
}
