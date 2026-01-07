import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class ReadingHistoryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByUser(userId: number) {
    return this.prisma.readingHistory.findMany({
      where: { user_id: userId },
      include: {
        comic: true,
        chapter: true,
      },
      orderBy: { updated_at: 'desc' },
    });
  }

  async updateOrCreate(comicId: number, chapterId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const existing = await this.prisma.readingHistory.findFirst({
      where: {
        user_id: userId,
        comic_id: comicId,
      },
    });

    if (existing) {
      return this.prisma.readingHistory.update({
        where: { id: existing.id },
        data: {
          chapter_id: chapterId,
        },
        include: {
          comic: true,
          chapter: true,
        },
      });
    }

    return this.prisma.readingHistory.create({
      data: {
        user_id: userId,
        comic_id: comicId,
        chapter_id: chapterId,
      },
      include: {
        comic: true,
        chapter: true,
      },
    });
  }

  async delete(comicId: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.prisma.readingHistory.deleteMany({
      where: {
        user_id: userId,
        comic_id: comicId,
      },
    });

    return { deleted: true };
  }
}



