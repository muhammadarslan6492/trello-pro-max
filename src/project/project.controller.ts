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
  Put,
  Param,
  ParseUUIDPipe,
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
  ApiParam,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenBlacklistInterceptor } from '../interceptor/token-blacklist.interceptor';

import { ProjectService } from './project.service';
import { CreateProjectDTO, UpdateProjectDTO } from './dto/project.dto';

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

      return this.projectService.listProjects(
        user,
        resolvedPage,
        resolvedPageSize,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to get a list of projects')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List projects retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async projectById(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    try {
      const { user } = req;
      const projectId: string = id;

      return this.projectService.projectById(user, projectId);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TokenBlacklistInterceptor)
  @ApiTags('This API is used to update a project by ID')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Project updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateProjectById(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDTO: UpdateProjectDTO,
  ) {
    try {
      const { user } = req;

      return this.projectService.updateProjectById(user, id, updateProjectDTO);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
