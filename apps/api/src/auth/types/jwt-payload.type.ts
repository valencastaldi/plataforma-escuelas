import { Role } from '@prisma/client';

export type JwtPayload = {
  sub: number;
  role: Role;
  email?: string | null;
  username?: string | null;
};
