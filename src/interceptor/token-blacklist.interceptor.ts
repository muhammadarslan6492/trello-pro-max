import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenBlacklistService } from '../auth/token-blacklist';

@Injectable()
export class TokenBlacklistInterceptor implements NestInterceptor {
  constructor(private readonly tokenBlacklistService: TokenBlacklistService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // Check if the token is blacklisted
    const isTokenBlacklisted =
      await this.tokenBlacklistService.isTokenBlackList(
        request.user.jwtTokenId,
      );

    console.log('this is final setups', isTokenBlacklisted);

    if (isTokenBlacklisted) {
      // Handle token blacklisting (e.g., return an unauthorized response)
      throw new ConflictException('Invalid auth token');
    }

    return next.handle();
  }
}
