export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verify: boolean;
  userType: string;
  token: string;
}
