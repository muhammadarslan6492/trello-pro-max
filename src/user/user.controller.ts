import {
  Controller,
  Post,
  Body,
  //   Get,
  InternalServerErrorException,
  //   Param,
  //   ParseEnumPipe,
  //   UnauthorizedException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import { UserService } from './user.service';
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
}
