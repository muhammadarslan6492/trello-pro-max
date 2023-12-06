export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verify: boolean;
  userType: string;
  token: string;
}

export interface Organization {
  id: string;
  name: string;
  userId: string;
}
