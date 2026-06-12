import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated, QuickQuestionDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toQuickQuestionDto } from './quick-questions.mapper';
import { AnswerTicketDto, UpdateTicketDto } from './dto/quick-question.dto';

@Injectable()
export class QuickQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<Paginated<QuickQuestionDto>> {
    const [items, total] = await Promise.all([
      this.prisma.quickQuestion.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.quickQuestion.count(),
    ]);
    return paginate(items.map(toQuickQuestionDto), total, query);
  }

  async answer(id: string, dto: AnswerTicketDto): Promise<QuickQuestionDto> {
    await this.getOrThrow(id);
    return toQuickQuestionDto(
      await this.prisma.quickQuestion.update({
        where: { id },
        data: {
          answer: dto.answer,
          status: 'answered',
          answeredAt: new Date(),
        },
      }),
    );
  }

  async update(id: string, dto: UpdateTicketDto): Promise<QuickQuestionDto> {
    await this.getOrThrow(id);
    return toQuickQuestionDto(
      await this.prisma.quickQuestion.update({
        where: { id },
        data: { paymentStatus: dto.paymentStatus },
      }),
    );
  }

  private async getOrThrow(id: string) {
    const ticket = await this.prisma.quickQuestion.findUnique({
      where: { id },
    });
    if (!ticket) throw new NotFoundException('ticket_not_found');
    return ticket;
  }
}
