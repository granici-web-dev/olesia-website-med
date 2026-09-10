import { Injectable } from '@nestjs/common';
import type { DashboardStatsDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import {
  AppointmentStatus,
  PaymentStatus,
  QuickQuestionStatus,
  SubscriptionStatus,
} from '../../generated/prisma/enums';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aggregate back-office metrics for a period (module_calendly.md §11). */
  async getStats(query: DashboardQueryDto): Promise<DashboardStatsDto> {
    const to = query.to ? new Date(query.to) : new Date();
    const from = query.from
      ? new Date(query.from)
      : new Date(to.getTime() - THIRTY_DAYS_MS);
    const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));

    const inPeriod = { startTime: { gte: from, lte: to } };

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
      this.prisma.appointment.count({
        where: {
          paymentStatus: PaymentStatus.pending,
          status: { not: AppointmentStatus.canceled },
        },
      }),
      this.prisma.service.findMany(),
      this.prisma.subscription.count({
        where: { status: SubscriptionStatus.active },
      }),
      this.prisma.subscription.aggregate({
        where: { status: SubscriptionStatus.active },
        _sum: { videoQuotaUsed: true, videoQuotaTotal: true },
      }),
      this.prisma.quickQuestion.count({
        where: { status: QuickQuestionStatus.open },
      }),
      this.prisma.quickQuestion.count({
        where: { createdAt: { gte: from, lte: to } },
      }),
      this.prisma.quickQuestion.findMany({
        where: { createdAt: { gte: from, lte: to }, answeredAt: { not: null } },
        select: { answeredAt: true, dueAt: true },
      }),
      this.prisma.appointment.findMany({
        where: { status: AppointmentStatus.scheduled, startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' },
        take: 5,
      }),
    ]);

    const svcMap = new Map(services.map((s) => [s.id, s]));

    const byService = byServiceRaw
      .map((r) => {
        const svc = svcMap.get(r.serviceId);
        return {
          serviceId: r.serviceId,
          code: (svc?.code ?? 'pediatric') as DashboardStatsDto['appointments']['byService'][number]['code'],
          titleRo: svc?.titleRo ?? '—',
          count: r._count._all,
        };
      })
      .sort((a, b) => b.count - a.count);

    const answeredInSla = answered.filter(
      (q) => q.answeredAt && q.answeredAt <= q.dueAt,
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
      upcoming: upcomingRaw.map((a) => ({
        id: a.id,
        clientName: a.clientName,
        serviceCode: (svcMap.get(a.serviceId)?.code ??
          'pediatric') as DashboardStatsDto['upcoming'][number]['serviceCode'],
        startTime: a.startTime.toISOString(),
        status: a.status as DashboardStatsDto['upcoming'][number]['status'],
        paymentStatus:
          a.paymentStatus as DashboardStatsDto['upcoming'][number]['paymentStatus'],
      })),
    };
  }
}
