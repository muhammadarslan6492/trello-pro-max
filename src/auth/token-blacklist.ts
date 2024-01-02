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

  async addUserToken(token: string, userId: string): Promise<void> {
    try {
      // Check if the token already exists for the given userId
      const tokenExists = await this.redisClient.sismember(userId, token);

      if (tokenExists) {
        // If the token exists, delete it
        await this.redisClient.srem(userId, token);
        console.log('Existing token removed');
      }

      // Add the new token
      const addToken = await this.redisClient.sadd(userId, token);

      if (addToken) {
        console.log('User token successfully added');
      }
    } catch (error) {
      throw new Error(`Error adding user token: ${error.message}`);
    }
  }

  async isTokenBlackList(tokenId: string): Promise<boolean> {
    const tokenSet = await this.redisClient.smembers('blackList');
    return tokenSet.includes(tokenId);
  }
}
