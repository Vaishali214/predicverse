import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../lib/validation.js';

const JWT_SECRET = process.env.JWT_SECRET || 'predicverse_secret_key_2026';
const BCRYPT_ROUNDS = 12;

export class AuthService {
  static async register(data: z.infer<typeof registerSchema>) {
    const { name, email, password } = data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: newUser.id,
          interests: '[]',
          preferredDestinations: '[]',
        },
      });

      await tx.travelDNA.create({
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt },
      token,
    };
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return {
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt },
      token,
    };
  }

  static async getMe(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded: { id: string; email: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    } catch {
      throw new AppError('Invalid or expired session. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return { user };
  }
}
