import { Injectable } from '@nestjs/common';
import {
  NEWSLETTER_CONSENT_VERSION,
  type Paginated,
  type SubscriberDto,
} from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto, paginate } from '../common/dto/pagination.dto';
import { Locale } from '../../generated/prisma/enums';
import { toSubscriberDto } from './newsletter.mapper';
import { SubscribeDto } from './dto/subscribe.dto';

/**
 * The newsletter list (brief §6c).
 *
 * Nothing here sends email. The site collected addresses through the library's
 * email gate and the footer signup and threw them away — the gate promised a
 * material "by email" that nothing was ever going to send (audit A6, F3). This
 * module is the missing half: the address is stored with the consent that
 * justifies keeping it, and the library hands the file over directly instead of
 * promising a message.
 */
@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Subscribe an address, or re-affirm one already on the list.
   *
   * Idempotent by address: someone who downloads three materials taps the same
   * button three times, and three rows for one person is a list that cannot be
   * unsubscribed from correctly. A repeat re-stamps the consent (it is a fresh
   * tick of the box, on the current wording) and clears an earlier
   * unsubscribe — that second tick is a new opt-in, not a leftover.
   *
   * `source` is kept as first recorded: where somebody joined does not change
   * because they came back through another door.
   */
  async subscribe(dto: SubscribeDto): Promise<void> {
    const consentAt = new Date();
    await this.prisma.subscriber.upsert({
      where: { email: dto.email },
      create: {
        email: dto.email,
        locale: dto.locale ?? Locale.ro,
        source: dto.source,
        consentAt,
        consentVersion: NEWSLETTER_CONSENT_VERSION,
      },
      update: {
        locale: dto.locale ?? Locale.ro,
        consentAt,
        consentVersion: NEWSLETTER_CONSENT_VERSION,
        unsubscribedAt: null,
      },
    });
  }

  /** The back office's "Abonați" list, newest first. */
  async findAll(query: PaginationQueryDto): Promise<Paginated<SubscriberDto>> {
    const [items, total] = await Promise.all([
      this.prisma.subscriber.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.subscriber.count(),
    ]);
    return paginate(items.map(toSubscriberDto), total, query);
  }
}
