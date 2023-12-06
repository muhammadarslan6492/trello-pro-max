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

  async listTeams(): Promise<void> {}
}
