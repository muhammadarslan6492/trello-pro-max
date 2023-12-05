import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Project name must be at least 4 characters long' })
  @MaxLength(32, {
    message: 'Project name cannot be longer than 32 characters',
  })
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Project name must be at least 4 characters long' })
  @MaxLength(100, {
    message: 'Project description cannot be longer than 100 characters',
  })
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  endDate?: Date;
}

export class UpdateProjectDTO {
  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Project name must be at least 4 characters long' })
  @MaxLength(32, {
    message: 'Project name cannot be longer than 32 characters',
  })
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Project name must be at least 4 characters long' })
  @MaxLength(100, {
    message: 'Project description cannot be longer than 100 characters',
  })
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  @ApiProperty()
  endDate?: Date;
}
