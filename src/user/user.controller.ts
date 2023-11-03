import {
  Controller,
  Post,
  Body,
  Get,
  InternalServerErrorException,
  //   Param,
  //   ParseEnumPipe,
  //   UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';

import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateUserDto,
  OtpVerifyDto,
  SigninDto,
  ResendOtpDto,
} from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  @ApiTags('This api is used to signup user')
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async signupUser(@Body() body: CreateUserDto) {
    try {
      return this.userService.createUser(body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Post('/verify-otp')
  @ApiTags('This api is used to verify user')
  @ApiCreatedResponse({ description: 'User verified successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async verify(@Body() body: OtpVerifyDto) {
    try {
      return this.userService.verifyOtp(body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Post('/resend-otp')
  @ApiTags('This api is used to resend otp')
  @ApiCreatedResponse({ description: 'Oto Successfully sent' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async resend(@Body() body: ResendOtpDto) {
    try {
      return this.userService.resendOtp(body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Post('/signin')
  @ApiTags('This api is used to signin user')
  @ApiCreatedResponse({ description: 'User signin successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async signin(@Body() body: SigninDto) {
    try {
      return this.userService.signin(body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard) // Protect this route with JWT authentication
  @ApiTags('This API is used to get the user profile')
  @ApiBearerAuth() // Add this line to specify that the API requires a bearer token
  @ApiOkResponse({ description: 'User profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(@Request() req) {
    // Access the authenticated user using req.user
    const user = req.user;
    // Your logic to retrieve the user's profile

    return user; // You can return the user's profile or any other data
  }
}
