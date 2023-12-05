import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiTags('This API is use to check App status')
  @ApiOkResponse({ description: 'return with message' })
  getHello(): string {
    return 'Hello, welcome to your NestJS application!';
  }
}
