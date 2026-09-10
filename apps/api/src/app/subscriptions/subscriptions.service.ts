import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Paginated, SubscriptionDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { writeOrTranslate } from '../common/prisma-errors';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { toSubscriptionDto } from './subscriptions.mapper';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<Paginated<SubscriptionDto>> {
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.subscription.count(),
    ]);
    return paginate(items.map(toSubscriptionDto), total, query);
  }

  async update(
    id: string,
    dto: UpdateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    await this.getOrThrow(id);
    return toSubscriptionDto(
      await writeOrTranslate(() =>
        this.prisma.subscription.update({
          where: { id },
          data: { status: dto.status, paymentStatus: dto.paymentStatus },
        }),
      ),
    );
  }

  /** Log one used video call; refuses once the monthly quota is exhausted. */
  async logVideoCall(id: string): Promise<SubscriptionDto> {
    const sub = await this.getOrThrow(id);
    if (sub.videoQuotaUsed >= sub.videoQuotaPerMonth) {
      throw new ConflictException('no_quota');
    }
    return toSubscriptionDto(
      await writeOrTranslate(() =>
        this.prisma.subscription.update({
          where: { id },
          data: { videoQuotaUsed: { increment: 1 } },
        }),
      ),
    );
  }

  private async getOrThrow(id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('subscription_not_found');
    return sub;
  }
}
