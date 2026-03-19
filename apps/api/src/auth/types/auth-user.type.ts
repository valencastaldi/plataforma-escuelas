import { Role } from '@prisma/client';

export type AuthUser = {
  userId: number;
  role: Role;
  email?: string | null;
  username?: string | null;
};
