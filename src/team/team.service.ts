import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { User } from 'src/user/user.interface';
import { CreateTeamDTO } from './dto/team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTeam(data: CreateTeamDTO, user: User): Promise<any> {
    try {
      const organization = await this.prismaService.organization.findFirst({
        where: {
          AND: {
            id: data.organizationId,
            userId: user.id,
          },
        },
      });

      if (!organization) {
        throw new NotFoundException('No organization found with org id');
      }

      const team = await this.prismaService.team.create({
        data: {
          name: data.name,
          organizationId: organization.id,
        },
      });

      return team;
    } catch (error) {
      throw new BadRequestException(`Team creation failed. ${error.message}`);
    }
  }

  async listTeams(
    user: User,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    try {
      const { userType } = user;
      let projects;

      if (userType === 'Admin') {
        projects = await this.prismaService.team.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
        });
      } else {
        projects = await this.prismaService.team.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

        if (!projects || projects.length === 0) {
          throw new NotFoundException('No teams found');
        }
      }

      return projects;
    } catch (error) {
      throw new NotFoundException('No teams found', error.message);
    }
  }
}
