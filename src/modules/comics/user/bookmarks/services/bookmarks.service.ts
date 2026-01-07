import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { RequestContext } from '@/common/utils/request-context.util';

@Injectable()
export class BookmarksService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getByUser(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { user_id: userId },
      include: {
        chapter: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(chapterId: number, pageNumber: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    return this.prisma.bookmark.create({
      data: {
        user_id: userId,
        chapter_id: chapterId,
        page_number: pageNumber,
      },
      include: {
        chapter: true,
      },
    });
  }

  async delete(id: number) {
    const userId = RequestContext.get<number>('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.prisma.bookmark.deleteMany({
      where: {
        id: id,
        user_id: userId,
      },
    });

    return { deleted: true };
  }
}



