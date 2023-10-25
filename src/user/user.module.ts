import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Utils } from '../utils/utils';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, Utils],
})
export class UserModule {}
