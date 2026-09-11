import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { PatientNotificationsService } from '../mail/patient-notifications.service';
import { UploadsService } from '../uploads/uploads.service';
import { MaterialGrantsService } from '../materials/material-grants.service';
import { intentMatches } from '../materials/material-grants.service';
import { describeTarget } from './describe-target';
import type { PurchaseNextStepDto } from '@olesia/shared';
import { PaymentState, PaymentTargetType } from '../../generated/prisma/enums';

/**
 * Everything that happens after the money is committed.
 *
 * Split out of `PaymentsService` when the third purchase arrived, which is
 * exactly the trigger `docs/shape-express-checkout.md` named: the deliverable
 * branch needs `uploads`, the material branch needs the grants, and a service
 * that already held Prisma, maib, working hours and mail would have had six
 * collaborators for two unrelated jobs. `PaymentsService` keeps the writes that
 * belong inside the transaction that records the payment; this holds the ones
 * that must not be — a mail round-trip, a file link, a second table — and every
 * one of them is idempotent, because the bank redelivers.
 *
 * It is still not an event bus. There is one caller, the switch is four cases
 * long, and a bus would buy indirection rather than decoupling — the same
 * answer as before, with the file extracted that the earlier shape said to
 * extract when it got here.
 */
@Injectable()
export class FulfilmentService {
  private readonly logger = new Logger(FulfilmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: PatientNotificationsService,
    private readonly uploads: UploadsService,
    private readonly grants: MaterialGrantsService,
  ) {}

  /**
   * Deliver what the payment bought, then tell the buyer.
   *
   * In that order deliberately: the receipt names what the buyer can do next
   * and carries the link to do it with, so the link has to exist before the
   * message is written. A failure to deliver is logged rather than thrown —
   * the money has arrived and the purchase is recorded, and failing the
   * callback over it would have the bank retry a payment we already hold.
   */
  async settle(paymentRowId: string): Promise<void> {
    const nextStep = await this.deliver(paymentRowId);
    await this.deliverReceipt(paymentRowId, nextStep);
  }

  /**
   * The per-purchase half. Returns what to tell the buyer they can do now, or
   * null when there is nothing beyond the receipt.
   */
  private async deliver(
    paymentRowId: string,
  ): Promise<PurchaseNextStepDto | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentRowId },
      select: {
        targetType: true,
        targetId: true,
        payerEmail: true,
        id: true,
      },
    });
    if (!payment?.targetId) return null;

    try {
      switch (payment.targetType) {
        case PaymentTargetType.deliverable_order:
          return await this.issueOrderUploadLink(payment.targetId);
        case PaymentTargetType.material:
          return await this.issueMaterialGrant(
            payment.targetId,
            payment.payerEmail,
            payment.id,
          );
        default:
          return null;
      }
    } catch (e) {
      // The purchase can have been deleted between paying for it and this
      // line. The payment is the record either way, and the doctor can issue
      // the link by hand from the back office.
      this.logger.error(
        `payment ${paymentRowId} recorded, fulfilment failed: ${String(e)}`,
      );
      return null;
    }
  }

  /**
   * A paid order gets its upload link straight away.
   *
   * The documents a protocol is built from are the next thing the buyer has to
   * do, and asking them to wait for the doctor to press a button is a day lost
   * on every order. Issued for every group-C product rather than for the two
   * protocols only: a menu is also written from what the client sends, and
   * "these three codes get a link, those two do not" is a rule somebody gets
   * wrong in six months. `linkForOrder` re-issues rather than duplicating, so
   * a redelivered callback extends the one link.
   */
  private async issueOrderUploadLink(
    orderId: string,
  ): Promise<PurchaseNextStepDto> {
    const link = await this.uploads.linkForOrder(orderId);
    return {
      kind: 'order_documents',
      url: link.url,
      expiresAt: link.expiresAt,
      downloadsLeft: null,
    };
  }

  /** A paid material gets the token that opens it. */
  private async issueMaterialGrant(
    materialId: string,
    payerEmail: string,
    paymentRowId: string,
  ): Promise<PurchaseNextStepDto> {
    return this.grants.issue({
      materialId,
      payerEmail,
      paymentId: paymentRowId,
    });
  }

  /**
   * The payment confirmation maib's go-live checklist requires (§8).
   *
   * `confirmationSentAt` is stamped only when the message actually left. With
   * no SMTP configured nothing leaves, and the back office then shows the
   * payment as unconfirmed with a resend button — the same honesty the answer
   * and upload-link paths already practise (audit A3, F2).
   */
  private async deliverReceipt(
    paymentRowId: string,
    nextStep: PurchaseNextStepDto | null,
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentRowId },
    });
    if (!payment || payment.confirmationSentAt) return;

    try {
      const { sent } = await this.notifications.paymentReceipt(
        {
          to: payment.payerEmail,
          locale: await this.localeForPayment(payment),
        },
        {
          clientName: payment.payerName ?? payment.payerEmail,
          orderId: payment.orderId,
          description: await describeTarget(this.prisma, payment),
          amount: Number(payment.amount),
          currency: payment.currency,
          paidAt: payment.paidAt ?? new Date(),
          nextStep: nextStep ?? undefined,
        },
      );
      if (sent) {
        await this.prisma.payment.update({
          where: { id: paymentRowId },
          data: { confirmationSentAt: new Date() },
        });
      }
    } catch (e) {
      this.logger.error(
        `payment ${paymentRowId} recorded, confirmation email failed: ${String(e)}`,
      );
    }
  }

  /**
   * What the buyer can do now, asked by their own return page.
   *
   * Keyed on the order reference **and** the intent key, and it is the second
   * one that decides: the reference travels to the bank, lives in the merchant
   * portal and lands on card statements, while the key never left the buyer's
   * tab. That is the whole difference between a PII-free status lookup, which
   * `orderId` alone is good enough for, and handing somebody a file.
   *
   * Read-only. It issues nothing — settling the payment already did that — so
   * a claim cannot extend a grant, reset a download counter, or bring back an
   * upload link the doctor revoked.
   *
   * Everything that can go wrong answers the same 404: a reference that is not
   * ours, a payment that is not paid, a purchase that hands nothing over, a
   * wrong key, a grant revoked with a refund, a link past its date. Telling
   * them apart would say whether a guessed reference is real.
   */
  async claimNextStep(
    orderId: string,
    intentKey: string,
  ): Promise<PurchaseNextStepDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      select: {
        id: true,
        state: true,
        intentKey: true,
        targetType: true,
        targetId: true,
      },
    });

    if (
      !payment ||
      payment.state !== PaymentState.paid ||
      !payment.targetId ||
      !intentMatches(payment.intentKey, intentKey)
    ) {
      throw new NotFoundException('next_step_not_found');
    }

    const step =
      payment.targetType === PaymentTargetType.material
        ? await this.grants.liveLinkForPayment(payment.id)
        : payment.targetType === PaymentTargetType.deliverable_order
          ? await this.liveOrderUploadLink(payment.targetId)
          : null;

    if (!step) throw new NotFoundException('next_step_not_found');
    return step;
  }

  private async liveOrderUploadLink(
    orderId: string,
  ): Promise<PurchaseNextStepDto | null> {
    const link = await this.uploads.liveLinkForOrder(orderId);
    return link
      ? {
          kind: 'order_documents',
          url: link.url,
          expiresAt: link.expiresAt,
          // An upload link is not counted; it is good until its date.
          downloadsLeft: null,
        }
      : null;
  }

  /**
   * Re-send the confirmation for a payment whose first attempt did not leave.
   * Clears the stamp first so a resend after a successful one is possible too —
   * the operator pressing this button has a reason we do not know.
   *
   * It looks the next step up rather than issuing one again, which is the
   * whole difference from `settle`. Re-issuing a material grant would reset
   * the buyer's download counter and push their expiry out by another thirty
   * days, and a resent email is not a second purchase.
   */
  async resendConfirmation(paymentRowId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentRowId },
    });
    if (!payment) throw new NotFoundException('payment_not_found');
    if (payment.state !== PaymentState.paid) {
      throw new BadRequestException('payment_not_paid');
    }

    await this.prisma.payment.update({
      where: { id: paymentRowId },
      data: { confirmationSentAt: null },
    });
    await this.deliverReceipt(
      paymentRowId,
      await this.existingNextStep(payment),
    );
  }

  /**
   * The next step as it stands, for a receipt that is being sent again.
   *
   * The order branch does re-issue: `linkForOrder` extends the one link rather
   * than minting a second, and a buyer who is being written to again because
   * the first message never arrived should get a link with time left on it.
   * The material branch does not, for the reason above.
   */
  private async existingNextStep(payment: {
    id: string;
    targetType: PaymentTargetType;
    targetId: string | null;
  }): Promise<PurchaseNextStepDto | null> {
    if (!payment.targetId) return null;

    try {
      if (payment.targetType === PaymentTargetType.deliverable_order) {
        return await this.issueOrderUploadLink(payment.targetId);
      }
      if (payment.targetType === PaymentTargetType.material) {
        return await this.grants.linkForPayment(payment.id);
      }
      return null;
    } catch (e) {
      this.logger.error(
        `resend for payment ${payment.id}: could not read the next step: ${String(e)}`,
      );
      return null;
    }
  }

  /** Which language to write the receipt in. */
  private async localeForPayment(payment: {
    targetType: PaymentTargetType;
    targetId: string | null;
  }): Promise<string | null> {
    if (!payment.targetId) return null;
    if (payment.targetType === PaymentTargetType.quick_question) {
      const ticket = await this.prisma.quickQuestion.findUnique({
        where: { id: payment.targetId },
        select: { locale: true },
      });
      return ticket?.locale ?? null;
    }
    if (payment.targetType === PaymentTargetType.deliverable_order) {
      const order = await this.prisma.deliverableOrder.findUnique({
        where: { id: payment.targetId },
        select: { locale: true },
      });
      return order?.locale ?? null;
    }
    // A paid material has no row of its own carrying a locale — the Payment is
    // the whole record — so the receipt is Romanian, like every other fallback.
    return null;
  }
}
