import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9]+$/, {
    message: 'Username must contain only alphanumeric characters',
  })
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  @MaxLength(32, { message: 'Username cannot be longer than 32 characters' })
  @ApiProperty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'First name must contain only alphabetic characters',
  })
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z]+$/, {
    message: 'Last name must contain only alphabetic characters',
  })
  @ApiProperty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, {
    message:
      'Password must contain at least one numeric digit and one special character',
  })
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;
}

export class OtpVerifyDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}

export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]+$/, {
    message:
      'Password must contain at least one numeric digit and one special character',
  })
  @ApiProperty()
  password: string;
}

export class ResendOtpDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
}

export class CreateOrganizationDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
