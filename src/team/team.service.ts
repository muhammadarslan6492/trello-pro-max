import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { MemberJWTInterface } from 'src/user/user.interface';
import { CreateTeamDTO } from './dto/team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTeam(
    data: CreateTeamDTO,
    user: MemberJWTInterface,
  ): Promise<any> {
    try {
      const { position, organizationId, id } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not create team out side the organization',
        );
      }

      const checkPremission =
        await this.prismaService.organizationPermission.findFirst({
          where: {
            userId: id,
            orgId: organizationId,
            canCreate: true,
          },
        });

      if (!checkPremission || position != 'Level_4') {
        throw new ConflictException('Access denied');
      }

      const team = await this.prismaService.team.create({
        data: {
          name: data.name,
          organizationId,
        },
      });

      return team;
    } catch (error) {
      throw new BadRequestException(`Team creation failed. ${error.message}`);
    }
  }

  async listTeams(
    user: MemberJWTInterface,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    try {
      const { organizationId, id } = user;

      if (!organizationId) {
        throw new ConflictException(
          'You can not get team list out side the organization',
        );
      }

      const checkPremission =
        await this.prismaService.organizationPermission.findFirst({
          where: {
            userId: id,
            orgId: organizationId,
            canGet: true,
          },
        });

      if (!checkPremission) {
        throw new ConflictException('Access denied');
      }

      const teams = await this.prismaService.team.findMany({
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

      if (!teams || teams.length === 0) {
        throw new NotFoundException('No projects found for the user');
      }
      return teams;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
