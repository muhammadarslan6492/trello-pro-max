import {
  Controller,
  Post,
  Body,
  //   Get,
  InternalServerErrorException,
  //   Param,
  //   ParseEnumPipe,
  //   UnauthorizedException,
  UseInterceptors,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  //   Query,
  //   Put,
  //   Param,
  //   ParseUUIDPipe,
  //   Delete,
} from '@nestjs/common';

import { TeamService } from './team.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from '../interceptor/token-blacklist.interceptor';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CreateTeamDTO } from './dto/team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to create proejct')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'This api return with success message and created project',
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UsePipes(new ValidationPipe())
  async createTeam(@Body() body: CreateTeamDTO, @Request() req) {
    try {
      const { user } = req;
      return this.teamService.createTeam(body, user);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to get a list of teams')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List teams retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async listProjects(
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

      return this.teamService.listTeams();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
