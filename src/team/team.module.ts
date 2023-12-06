import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [TeamController],
  providers: [TeamService, PrismaService],
})
export class TeamModule {}
