import {
  BadRequestException,
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserDto,
  OtpVerifyDto,
  SigninDto,
  ResendOtpDto,
} from './dto/user.dto';

import { Utils } from '../utils/utils';
import { User } from './user.interface';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly utils: Utils,
    private readonly authService: AuthService,
  ) {}

  async createUser({
    username,
    email,
    password,
    firstName,
    lastName,
  }: CreateUserDto): Promise<string> {
    try {
      const existingUser = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              username: username,
            },
            {
              email: email,
            },
          ],
        },
      });
      if (existingUser) {
        throw new ConflictException('User already exist');
      }
      const hash = await this.utils.hashPassword(password);
      const User = await this.prismaService.user.create({
        data: {
          username,
          email,
          password: hash,
          firstName,
          lastName,
        },
      });
      const otpCode = this.utils.generateOTPCode();

      console.log(User);

      // Calculate the expiration time (one hour from now)
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);

      // Create the OTP entry in the database
      const otp = await this.prismaService.oTP.create({
        data: {
          code: otpCode,
          expiresAt: expirationTime,
          userId: User.id,
        },
      });
      console.log(otp);
      return 'OTP sent to your email address';
    } catch (error) {
      throw new BadRequestException(`User creation failed. ${error.message}`);
    }
  }

  async verifyOtp({ email, code }: OtpVerifyDto): Promise<string> {
    try {
      const otp = await this.prismaService.oTP.findFirst({
        where: {
          AND: [
            {
              code: code,
              expiresAt: { gte: new Date() },
              isExpired: false,
              user: {
                email: email,
              },
            },
          ],
        },
      });
      if (!otp) {
        throw new ConflictException('Invalid Opt');
      }

      await this.prismaService.oTP.update({
        where: {
          id: otp.id,
        },
        data: {
          isExpired: true,
        },
      });
      await this.prismaService.user.update({
        where: {
          email: email,
        },
        data: {
          verify: true,
        },
      });
      return 'User verified successfully';
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }

  async resendOtp({ email }: ResendOtpDto): Promise<string> {
    // Find the user
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new ConflictException('User not found');
    }

    await this.prismaService.oTP.updateMany({
      where: {
        userId: user.id,
        isExpired: false,
      },
      data: {
        isExpired: true,
      },
    });

    // Generate a new OTP code
    const otpCode = this.utils.generateOTPCode();

    // Calculate the expiration time (e.g., one hour from now)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    // Create a new OTP entry in the database
    await this.prismaService.oTP.create({
      data: {
        code: otpCode,
        expiresAt: expirationTime,
        userId: user.id,
      },
    });

    // You can send the new OTP to the user's email (implement this logic)

    return 'OTP sent to your email address';
  }

  async signin({ email, password }: SigninDto): Promise<User> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Email or Password is invalid.');
      }

      if (!user.verify) {
        throw new ConflictException('User not verified yet.');
      }
      const isPasswordValid = this.authService.comparePasswords(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email or password is invalid.');
      }

      const timestamp = Date.now();
      const tokenDate = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verify: user.verify,
        userType: user.usertype,
        timestamp: timestamp,
      };

      const token = await this.authService.generateToken(tokenDate);

      const userWithToken: User = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verify: user.verify,
        token: token,
        userType: user.usertype,
      };

      return userWithToken;
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }
}
