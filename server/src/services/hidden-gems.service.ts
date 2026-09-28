import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

export class HiddenGemsService {
  static async getAllGems() {
    const gems = await prisma.hiddenGem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return { gems };
  }

  static async getGemById(gemId: string) {
    const gem = await prisma.hiddenGem.findUnique({ where: { id: gemId } });

    if (!gem || !gem.isActive) {
      throw new AppError('Hidden gem not found.', 404);
    }
    return { gem };
  }
}
