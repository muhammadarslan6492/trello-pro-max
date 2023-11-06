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
    const addtoken = await this.redisClient.sadd('blackList', tokenId);
    console.log(addtoken);
    return addtoken;
  }

  async isTokenBlackList(tokenId: string): Promise<boolean> {
    const tokenSet = await this.redisClient.smembers('blackList');
    console.log(tokenSet);
    return tokenSet.includes(tokenId);
  }
}
