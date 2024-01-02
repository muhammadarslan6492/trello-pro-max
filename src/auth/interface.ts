export interface TokenGenerateInput {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verify: boolean;
  userType: string;
  timestamp: number;
}
