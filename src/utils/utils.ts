import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Utils {
  private readonly secretKey: string = 'your-secret-key';

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // You can adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  generateOTPCode(): string {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number

    // Generate a random number between min and max
    const otpNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Convert the number to a string with leading zeros if needed
    const otpCode = otpNumber.toString().padStart(6, '0');

    return otpCode;
  }
}
