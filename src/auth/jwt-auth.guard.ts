// src/auth/jwt-auth.guard.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service'; // Import your AuthService

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    try {
      const token = this.extractTokenFromHeader(request.headers.authorization);
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }

      const user = await this.validateToken(token); // Validate the token
      if (!user.verify) {
        throw new UnauthorizedException('User not verified');
      }
      request.user = user; // Attach the user object to the request
      return true;
    } catch (err) {
      throw err;
    }
  }

  private extractTokenFromHeader(authorizationHeader: string): string | null {
    if (!authorizationHeader) {
      return null;
    }
    const parts = authorizationHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    return null;
  }

  async validateToken(token: string) {
    // Verify the token using your AuthService or your preferred method
    return this.authService.verifyToken(token);
  }
}
