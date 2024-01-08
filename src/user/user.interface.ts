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

export interface MemberJWTInterface {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verify: boolean;
  position: string;
  level: string;
  organizationId: string;
  token?: string;
  userType?: string;
}

export interface OrganizationListInterface {
  id: string;
  name: string;
  userId: string;
}
