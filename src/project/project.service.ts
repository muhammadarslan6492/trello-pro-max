import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  CreateProjectDTO,
  UpdateProjectDTO,
  AssignTeamsToProjectDto,
} from './dto/project.dto';
import { Project } from './project.interface';
import { MemberJWTInterface, User } from 'src/user/user.interface';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProject(
    data: CreateProjectDTO,
    user: MemberJWTInterface,
  ): Promise<Project> {
    try {
      const { id, level, organizationId } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not create project out side the organization',
        );
      }

      const checkPremission =
        await this.prismaService.organizationPermission.findFirst({
          where: {
            AND: {
              orgId: organizationId,
              userId: id,
              canCreate: true,
            },
          },
        });

      if (!checkPremission || level != 'Level_4') {
        throw new ConflictException('Access denied');
      }

      const userId = id;
      const obj = { ...data, userId, organizationId };
      const project = await this.prismaService.project.create({
        data: obj,
      });
      return project;
    } catch (error) {
      throw new BadRequestException(
        `Project creation failed. ${error.message}`,
      );
    }
  }

  async listProjects(
    user: MemberJWTInterface,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    try {
      const { organizationId } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not get project list out side the organization',
        );
      }

      const projects = await this.prismaService.project.findMany({
        where: { organizationId },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      if (!projects || projects.length === 0) {
        throw new NotFoundException('No projects found for the user');
      }
      return projects;
    } catch (error) {
      throw new NotFoundException('No projects found', error.message);
    }
  }

  async projectById(
    user: MemberJWTInterface,
    projectId: string,
  ): Promise<Project> {
    try {
      const { organizationId } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not get project out side the organization',
        );
      }

      const project = await this.prismaService.project.findFirst({
        where: { AND: { id: projectId, organizationId } },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      if (!project) {
        throw new NotFoundException('No projects found with this id');
      }
      return project;
    } catch (error) {
      throw new NotFoundException('No projects found', error.message);
    }
  }

  async updateProjectById(
    user: MemberJWTInterface,
    projectId: string,
    data: UpdateProjectDTO,
  ): Promise<Project> {
    try {
      const { id, organizationId } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not update project out side the organization',
        );
      }

      let project;

      const checkPremission =
        await this.prismaService.organizationPermission.findFirst({
          where: {
            userId: id,
            orgId: organizationId,
            canUpdate: true,
          },
        });

      if (!checkPremission) {
        throw new ConflictException('Access denied');
      }

      project = await this.prismaService.project.findFirst({
        where: { AND: { id: projectId, organizationId } },
      });
      if (!project) {
        throw new NotFoundException('No projects found with this id');
      }

      project = await this.prismaService.project.update({
        where: { id: projectId },
        data: { ...data },
      });

      return project;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteProject(
    user: MemberJWTInterface,
    projectId: string,
  ): Promise<string> {
    try {
      const { id, organizationId } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not delete project out side the organization',
        );
      }

      let project;

      const checkPremission =
        await this.prismaService.organizationPermission.findFirst({
          where: {
            userId: id,
            orgId: organizationId,
            canDelete: true,
          },
        });

      if (!checkPremission) {
        throw new ConflictException('Access denied');
      }

      project = await this.prismaService.project.findFirst({
        where: { id: projectId },
      });
      if (!project) {
        throw new NotFoundException('No projects found with this id');
      }
      project = await this.prismaService.project.delete({
        where: { id: projectId },
      });

      return 'Project deleted';
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async assignTeamsToProject(
    input: AssignTeamsToProjectDto,
    user: User,
  ): Promise<string> {
    try {
      const { projectId, teamIds } = input;

      const project = await this.prismaService.project.findFirst({
        where: {
          id: projectId,
          userId: user.id,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }
      const projectsTeamsData = teamIds.map((teamId) => ({
        projectId,
        teamId,
      }));

      // Validate teamIds
      const validTeams = await this.prismaService.team.findMany({
        where: {
          id: {
            in: teamIds,
          },
          organizationId: project.organizationId,
        },
      });

      if (validTeams.length !== teamIds.length) {
        throw new BadRequestException('Invalid teamId(s) provided');
      }

      await this.prismaService.projectsTeams.createMany({
        data: projectsTeamsData,
      });

      return `Teams assigned to project with ID ${projectId}`;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
