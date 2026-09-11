import { PrismaService } from '../prisma/prisma.service';
import { PaymentTargetType, ServiceCode } from '../../generated/prisma/enums';

/**
 * What to call the thing a payment bought.
 *
 * The bank's own `orderInfo.description` is not stored, so this is
 * reconstructed from whichever catalog priced the purchase — the same source
 * that decided the amount. Two callers need it and neither may call the other:
 * the public return page (`PaymentsService.publicStatus`) and the receipt
 * (`FulfilmentService`), and `payments → fulfilment` is the only direction
 * without a cycle in it. So it is a function rather than a method on either.
 *
 * A row that has been deleted since falls back to the target type, which is
 * what the ledger will show the doctor anyway.
 */
export async function describeTarget(
  prisma: PrismaService,
  payment: { targetType: PaymentTargetType; targetId: string | null },
): Promise<string> {
  switch (payment.targetType) {
    case PaymentTargetType.quick_question: {
      // The EXPRESS ticket carries no title of its own: it is one service, and
      // the client edits its name in the back office.
      const service = await prisma.service.findUnique({
        where: { code: ServiceCode.quick_question },
        select: { titleRo: true },
      });
      return service?.titleRo ?? 'Întrebare EXPRESS';
    }
    case PaymentTargetType.deliverable_order: {
      if (!payment.targetId) break;
      // The order's own `titleRo`, stamped from the catalog when it was
      // placed, so a later price-list edit does not rewrite a receipt.
      const order = await prisma.deliverableOrder.findUnique({
        where: { id: payment.targetId },
        select: { titleRo: true },
      });
      if (order) return order.titleRo;
      break;
    }
    case PaymentTargetType.material: {
      if (!payment.targetId) break;
      const material = await prisma.material.findUnique({
        where: { id: payment.targetId },
        select: { titleRo: true },
      });
      if (material) return material.titleRo;
      break;
    }
    default:
      break;
  }
  return payment.targetType;
}
