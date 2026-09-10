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
          data: { status: dto.status },
        }),
      ),
    );
  }

  /**
   * Log one used video call; refuses once the quota is exhausted.
   *
   * One conditional write, not a read followed by a write (audit A5, F2). The
   * check and the increment used to be two round trips, so ten clicks landing
   * together all read the same balance, all passed, and all incremented — ten
   * parallel calls against a quota of six recorded seven. `updateMany` puts
   * the condition in the WHERE clause, where Postgres evaluates it against the
   * row it is about to write; a caller that matches nothing is the one who
   * lost the race, and gets the same 409 as the one who ran out honestly.
   */
  async logVideoCall(id: string): Promise<SubscriptionDto> {
    await this.getOrThrow(id);

    const { count } = await this.prisma.subscription.updateMany({
      where: { id, videoQuotaUsed: { lt: this.prisma.subscription.fields.videoQuotaTotal } },
      data: { videoQuotaUsed: { increment: 1 } },
    });
    if (count === 0) throw new ConflictException('no_quota');

    return toSubscriptionDto(await this.getOrThrow(id));
  }

  private async getOrThrow(id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('subscription_not_found');
    return sub;
  }
}
