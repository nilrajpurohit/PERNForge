import bcrypt from 'bcrypt';
import prisma from './db.service.js';

export type NewUserPayload = {
  name?: string;
  email: string;
  password: string;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(payload: NewUserPayload) {
  const hashedPassword = await bcrypt.hash(payload.password, 12);
  return prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      name: payload.name
    }
  });
}
