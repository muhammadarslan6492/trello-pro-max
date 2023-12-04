import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProjectDTO, UpdateProjectDTO } from './dto/project.dto';
import { Project } from './project.interface';

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
    user,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<[Project]> {
    try {
      const { id, UserType } = user;
      let projects;

      if (UserType === 'Admin') {
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

  async projectById(user, projectId: string): Promise<Project> {
    try {
      const { id, UserType } = user;

      let project;

      if (UserType === 'Admin') {
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
    user,
    projectId,
    data: UpdateProjectDTO,
  ): Promise<Project> {
    try {
      const { UserType } = user;
      let project;

      if (UserType === 'Admin') {
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
      } else {
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
      }

      return project;
    } catch (err) {
      throw new NotFoundException(err.message);
    }
  }
}