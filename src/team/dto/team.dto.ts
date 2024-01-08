import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Team name must be at least 4 characters long' })
  @MaxLength(32, {
    message: 'Team name cannot be longer than 32 characters',
  })
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  leadId: string;
}
