import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379, // Default Redis port
    });
  }

  async addToBlackList(tokenId: string): Promise<any> {
    // await this.redisClient.flushall();
    const addtoken = await this.redisClient.sadd('blackList', tokenId);
    if (addtoken) {
      return { message: 'User logout successfully' };
    }
    throw new Error('Something went wrong');
  }

  async isTokenBlackList(tokenId: string): Promise<boolean> {
    const tokenSet = await this.redisClient.smembers('blackList');
    return tokenSet.includes(tokenId);
  }
}
