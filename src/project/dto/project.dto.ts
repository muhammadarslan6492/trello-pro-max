import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/, {
    message:
      'Project name must contain at least one alphabetic character and may include alphanumeric characters and spaces',
  })
  @MinLength(4, { message: 'Project name must be at least 4 characters long' })
  @MaxLength(32, {
    message: 'Project name cannot be longer than 32 characters',
  })
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-zA-Z])[a-zA-Z0-9\s]+$/, {
    message:
      'Project description must contain at least one alphabetic character and may include alphanumeric characters and spaces',
  })
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
