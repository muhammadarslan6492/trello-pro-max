import {
  Controller,
  Post,
  Body,
  Get,
  InternalServerErrorException,
  UseInterceptors,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateUserDto,
  OtpVerifyDto,
  SigninDto,
  ResendOtpDto,
  CreateOrganizationDTO,
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

  @Post('/add-organization')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This api is used to create organization')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User profile retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async organization(@Body() body: CreateOrganizationDTO, @Request() req) {
    try {
      const { user } = req;
      return this.userService.createOrganization(user, body);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('/list-organization')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to get a list of organizations')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List organizations retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async listOrganizations(
    @Request() req,
    @Query('page') page?: any,
    @Query('pageSize') pageSize?: any,
  ) {
    try {
      const { user } = req;

      // Set default values from environment variables
      const defaultPage = parseInt(process.env.DEFAULT_PAGE || '1', 10);
      const defaultPageSize = parseInt(
        process.env.DEFAULT_PAGE_SIZE || '10',
        10,
      );

      // Use default values if page and pageSize are not provided
      const resolvedPage =
        page !== undefined ? parseInt(page, 10) : defaultPage;
      const resolvedPageSize =
        pageSize !== undefined ? parseInt(pageSize, 10) : defaultPageSize;

      return this.userService.listOrganizations(
        user,
        resolvedPage,
        resolvedPageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
