import {
  BadRequestException,
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CreateProjectDTO } from './dto/project.dto';
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
}
