/**
 * What paying for a group-C order is allowed to change about it.
 *
 * The twin of `ticket-activation.spec.ts`, and here for the same reason: maib
 * redelivers its success notification and the reconcile sweep writes the same
 * transition from the other side, so the question is not "does paying open the
 * order" but "can paying *twice* walk a finished one backwards". It must not.
 */
import { DeliverableOrderStatus } from '../../generated/prisma/enums';
import { activateOrderData } from './deliverable-orders.service';

describe('activateOrderData', () => {
  it('opens an order that is still awaiting payment', () => {
    expect(activateOrderData(DeliverableOrderStatus.awaiting_payment)).toEqual({
      status: DeliverableOrderStatus.new,
    });
  });

  it('leaves an order the doctor has already seen alone', () => {
    expect(activateOrderData(DeliverableOrderStatus.new)).toBeNull();
  });

  it('does not pull an order back out of preparation', () => {
    expect(activateOrderData(DeliverableOrderStatus.in_progress)).toBeNull();
  });

  it('does not undeliver a delivered order', () => {
    expect(activateOrderData(DeliverableOrderStatus.delivered)).toBeNull();
  });

  it('does not resurrect a canceled one', () => {
    expect(activateOrderData(DeliverableOrderStatus.canceled)).toBeNull();
  });
});
