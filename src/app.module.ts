import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    CacheModule.register({ isGlobal: true }),
    ProjectModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
