import { Injectable } from '@nestjs/common';
import type { DashboardStatsDto, DashboardUpcomingItem } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import {
  AppointmentStatus,
  PaymentState,
  QuickQuestionStatus,
  SubscriptionStatus,
} from '../../generated/prisma/enums';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aggregate back-office metrics for a period (module_calendly.md §11). */
  async getStats(
    query: DashboardQueryDto,
    options: { withUpcoming: boolean },
  ): Promise<DashboardStatsDto> {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - THIRTY_DAYS_MS);
    const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));

    const inPeriod = { startTime: { gte: from, lte: to } };
    // The card says "Ultimele 30 de zile", so every number under it is for
    // those days. Three of the four used to ignore the period entirely and
    // report an all-time figure beside a dated one (audit A9, F16).
    const createdInPeriod = { createdAt: { gte: from, lte: to } };

    const [
      total,
      previousTotal,
      byServiceRaw,
      scheduled,
      completed,
      noShow,
      canceled,
      pendingPayments,
      services,
      activeSubs,
      quotaAgg,
      open,
      qqTotal,
      answered,
      upcomingRaw,
    ] = await Promise.all([
      this.prisma.appointment.count({ where: inPeriod }),
      this.prisma.appointment.count({
        where: { startTime: { gte: prevFrom, lt: from } },
      }),
      this.prisma.appointment.groupBy({
        by: ['serviceId'],
        where: inPeriod,
        _count: { _all: true },
      }),
      this.prisma.appointment.count({
        where: { ...inPeriod, status: AppointmentStatus.scheduled },
      }),
      this.prisma.appointment.count({
        where: { ...inPeriod, status: AppointmentStatus.completed },
      }),
      this.prisma.appointment.count({
        where: { ...inPeriod, status: AppointmentStatus.no_show },
      }),
      this.prisma.appointment.count({
        where: { ...inPeriod, status: AppointmentStatus.canceled },
      }),
      // Money that has not arrived, from the ledger rather than from one
      // table's mirror of it. This counted appointments alone, so an unpaid
      // order, question, subscription or material was not "in așteptare" for
      // the doctor at all (audit A9, F15).
      this.prisma.payment.count({
        where: {
          ...createdInPeriod,
          state: { in: [PaymentState.created, PaymentState.pending] },
        },
      }),
      this.prisma.service.findMany(),
      this.prisma.subscription.count({
        where: { ...createdInPeriod, status: SubscriptionStatus.active },
      }),
      this.prisma.subscription.aggregate({
        where: { status: SubscriptionStatus.active },
        _sum: { videoQuotaUsed: true, videoQuotaTotal: true },
      }),
      this.prisma.quickQuestion.count({
        where: { ...createdInPeriod, status: QuickQuestionStatus.open },
      }),
      this.prisma.quickQuestion.count({
        // Unpaid tickets are questions nobody bought. Counting them here would
        // report an EXPRESS volume the practice never sold.
        where: {
          createdAt: { gte: from, lte: to },
          status: { not: QuickQuestionStatus.awaiting_payment },
        },
      }),
      this.prisma.quickQuestion.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          answeredAt: { not: null },
          // A ticket with no deadline was never owed one, so it has no SLA to
          // be inside or outside of — it belongs in neither half of the rate.
          dueAt: { not: null },
        },
        select: { answeredAt: true, dueAt: true },
      }),
      options.withUpcoming
        ? this.prisma.appointment.findMany({
            where: {
              status: AppointmentStatus.scheduled,
              startTime: { gte: new Date() },
            },
            orderBy: { startTime: 'asc' },
            take: 5,
          })
        : null,
    ]);

    const svcMap = new Map(services.map((s) => [s.id, s]));

    const byService = byServiceRaw
      .map((r) => {
        const svc = svcMap.get(r.serviceId);
        return {
          serviceId: r.serviceId,
          code: (svc?.code ??
            'pediatric') as DashboardStatsDto['appointments']['byService'][number]['code'],
          titleRo: svc?.titleRo ?? '—',
          count: r._count._all,
        };
      })
      .sort((a, b) => b.count - a.count);

    const answeredInSla = answered.filter(
      (q) => q.answeredAt && q.dueAt && q.answeredAt <= q.dueAt,
    ).length;

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      appointments: {
        total,
        previousTotal,
        byService,
        scheduled,
        completed,
        noShow,
        canceled,
        completionRate: total > 0 ? completed / total : 0,
      },
      pendingPayments,
      subscriptions: {
        active: activeSubs,
        quotaUsed: quotaAgg._sum.videoQuotaUsed ?? 0,
        quotaTotal: quotaAgg._sum.videoQuotaTotal ?? 0,
      },
      quickQuestions: {
        open,
        total: qqTotal,
        slaRate: answered.length > 0 ? answeredInSla / answered.length : 0,
      },
      upcoming: upcomingRaw?.map((a) => ({
        id: a.id,
        clientName: a.clientName,
        serviceCode: (svcMap.get(a.serviceId)?.code ??
          'pediatric') as DashboardUpcomingItem['serviceCode'],
        startTime: a.startTime.toISOString(),
        status: a.status as DashboardUpcomingItem['status'],
        paymentStatus:
          a.paymentStatus as DashboardUpcomingItem['paymentStatus'],
      })),
    };
  }
}
