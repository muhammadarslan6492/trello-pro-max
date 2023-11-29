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
  Query,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  // ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from '../interceptor/token-blacklist.interceptor';

import { ProjectService } from './project.service';
import { CreateProjectDTO } from './dto/project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
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
  async createProject(@Body() body: CreateProjectDTO, @Request() req) {
    try {
      const id = req.user.id;
      return this.projectService.createProject(body, id);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to get a list of projects')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List projects retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'pageSize', type: Number, required: false })
  async listProjects(
    @Request() req,
    @Query('page', ParseIntPipe) page?: number,
    @Query('pageSize', ParseIntPipe) pageSize?: number,
  ) {
    try {
      const { user } = req;
      const defaultPage = parseInt(process.env.DEFAULT_PAGE || '1', 10);
      const defaultPageSize = parseInt(
        process.env.DEFAULT_PAGE_SIZE || '10',
        10,
      );
      const resolvedPage = page || defaultPage;
      const resolvedPageSize = pageSize || defaultPageSize;

      return this.projectService.listProjects(
        user,
        resolvedPage,
        resolvedPageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
