import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}
export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}
