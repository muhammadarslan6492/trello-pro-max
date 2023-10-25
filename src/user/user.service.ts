import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';

import { Utils } from '../utils/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly utils: Utils,
  ) {}

  async createUser({ username, email, password }: CreateUserDto) {
    try {
      // Assuming 'User' is the Prisma model for users

      const hash = await this.utils.hashPassword(password);
      const User = await this.prismaService.user.create({
        data: {
          username,
          email,
          password: hash,
        },
      });
      return User;
    } catch (error) {
      // Handle errors, for example, duplicate email or username
      console.log(error);
      throw new BadRequestException(`User creation failed ${error.message}`);
    }
  }
}
