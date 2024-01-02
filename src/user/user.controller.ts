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
  ParseUUIDPipe,
  Param,
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
  @ApiTags('Signup')
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
  @ApiTags('Verify-OTP')
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
  @ApiTags('Resent-OTP')
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
  @ApiTags('Signin')
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
  @ApiTags('Get Profile')
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
  @ApiTags('Logout')
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
  @ApiTags('Add Organization')
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
  @ApiTags('List Organiazation')
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

  @Get('/switch-organization/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('Switch Organization')
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Return with updated User token for switched organization successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async switchOrganization(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    try {
      const { user } = req;
      const organizationId: string = id;
      return this.userService.switchOrganization(user, organizationId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Get('/logout-organization')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('Logout Organization')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return with updated User token without any organization info',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async logoutOrganization(@Request() req) {
    try {
      const { user } = req;
      const token = req.headers.authorization.split(' ')[1];

      const response = await this.userService.logoutOrganization(user);

      await this.tokenBlackList.addToBlackList(token);

      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
