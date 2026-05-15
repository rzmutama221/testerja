import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Extend NextAuth types untuk include custom fields (role, username)
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: 'USER' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    username: string;
    role: 'USER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    role: 'USER' | 'ADMIN';
  }
}
