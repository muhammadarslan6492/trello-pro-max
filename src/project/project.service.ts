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
import { User } from 'src/user/user.interface';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async createProject(data: CreateProjectDTO, userId): Promise<Project> {
    try {
      const obj = { ...data, userId };
      const project = await this.prismaService.project.create({ data: obj });

      await this.prismaService.projectPermission.create({
        data: {
          projectId: project.id,
          userId,
          canGet: true,
          canCreate: true,
          canUpdate: true,
          canDelete: true,
        },
      });

      return project;
    } catch (error) {
      throw new BadRequestException(
        `Project creation failed. ${error.message}`,
      );
    }
  }

  async listProjects(
    user: User,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<[any]> {
    try {
      const { id, userType } = user;
      let projects;

      if (userType === 'Admin') {
        projects = await this.prismaService.project.findMany({
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
          skip: (page - 1) * pageSize,
          take: pageSize,
        });
      } else {
        projects = await this.prismaService.project.findMany({
          where: { userId: id },
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
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

        if (!projects || projects.length === 0) {
          throw new NotFoundException('No projects found for the user');
        }
      }

      return projects;
    } catch (error) {
      throw new NotFoundException('No projects found', error.message);
    }
  }

  async projectById(user: User, projectId: string): Promise<Project> {
    try {
      const { id, userType } = user;

      let project;

      if (userType === 'Admin') {
        project = await this.prismaService.project.findFirst({
          where: { id: projectId },
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
          throw new NotFoundException('No projects found');
        }
        return project;
      } else {
        project = await this.prismaService.project.findFirst({
          where: { AND: { id: projectId, userId: id } },
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
      }
      return project;
    } catch (error) {
      throw new NotFoundException('No projects found', error.message);
    }
  }

  async updateProjectById(
    user: User,
    projectId: string,
    data: UpdateProjectDTO,
  ): Promise<Project> {
    try {
      const { userType, id } = user;
      let project;

      if (userType === 'Admin') {
        project = await this.prismaService.project.findFirst({
          where: { id: projectId },
        });
        if (!project) {
          throw new NotFoundException('No projects found with this id');
        }
        project = await this.prismaService.project.update({
          where: { id: projectId },
          data: { ...data },
        });
        return project;
      }

      const permission = await this.prismaService.projectPermission.findFirst({
        where: {
          AND: { projectId, userId: id },
        },
      });

      if (permission?.canUpdate) {
        project = await this.prismaService.project.findFirst({
          where: { id: projectId },
        });
        if (!project) {
          throw new NotFoundException('No projects found with this id');
        }
        project = await this.prismaService.project.update({
          where: { id: projectId },
          data: { ...data },
        });

        return project;
      }

      throw new ConflictException('Access denied.. ');
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async deleteProject(user: User, projectId: string): Promise<string> {
    try {
      const { id, userType } = user;
      let project;

      if (userType === 'Admin') {
        project = await this.prismaService.project.delete({
          where: { id: projectId },
          include: { permissions: true }, // Include related permissions
        });

        return 'Project deleted';
      }
      const permission = await this.prismaService.projectPermission.findFirst({
        where: {
          AND: { projectId, userId: id },
        },
      });

      if (permission?.canDelete) {
        project = await this.prismaService.project.findFirst({
          where: { id: projectId },
        });
        if (!project) {
          throw new NotFoundException('No projects found with this id');
        }
        project = await this.prismaService.project.delete({
          where: { id: projectId },
          include: { permissions: true }, // Include related permissions
        });

        return 'Project deleted';
      }

      throw new ConflictException('Access denied.. ');
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
