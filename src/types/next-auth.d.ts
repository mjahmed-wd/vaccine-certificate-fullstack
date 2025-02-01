import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
    center: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
    center: string;
  }
} 