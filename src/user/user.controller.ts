import {
  Controller,
  Post,
  Body,
  Get,
  InternalServerErrorException,
  //   Param,
  //   ParseEnumPipe,
  //   UnauthorizedException,
  UseInterceptors,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
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
import { TokenBlacklistService } from '../auth/token-blacklist';
import { TokenBlacklistInterceptor } from '../interceptor/token-blacklist.interceptor';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenBlackList: TokenBlacklistService,
  ) {}

  @Post('/signup')
  @ApiTags('This api is used to signup user')
  @ApiCreatedResponse({ description: 'User created successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @UsePipes(new ValidationPipe())
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
  @UsePipes(new ValidationPipe())
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
  @UsePipes(new ValidationPipe())
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
  @UsePipes(new ValidationPipe())
  async signin(@Body() body: SigninDto) {
    try {
      return this.userService.signin(body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to get the user profile')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getProfile(@Request() req) {
    const user = req.user;
    return user;
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This is logout Api')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User logout successfully' })
  async logout(@Request() req) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      return await this.tokenBlackList.addToBlackList(token);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
