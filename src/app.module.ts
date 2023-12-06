import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ProjectModule } from './project/project.module';
import { AppController } from './app.controller';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    CacheModule.register({ isGlobal: true }),
    ProjectModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
