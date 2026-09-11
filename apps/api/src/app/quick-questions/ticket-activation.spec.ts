/**
 * What paying does to an EXPRESS ticket.
 *
 * One rule, and it is the whole reason this function exists separately from the
 * `updateMany` that applies it: **a ticket that is not `awaiting_payment` is
 * not touched**. maib may deliver the same success notification more than once
 * and the 10-minute reconcile sweep writes the same transition from the other
 * side, so an unconditional write would reopen an answered ticket and hand the
 * doctor a deadline she had already met.
 */
import { QuickQuestionStatus } from '../../generated/prisma/enums';
import { activateTicketData } from './quick-questions.service';

const DUE_AT = new Date('2026-09-11T14:00:00Z');

describe('activateTicketData', () => {
  it('opens an unpaid ticket and starts its clock at the payment', () => {
    expect(
      activateTicketData(QuickQuestionStatus.awaiting_payment, DUE_AT),
    ).toEqual({ status: QuickQuestionStatus.open, dueAt: DUE_AT });
  });

  it('leaves an already open ticket alone, so a second callback restarts nothing', () => {
    expect(activateTicketData(QuickQuestionStatus.open, DUE_AT)).toBeNull();
  });

  it('never reopens an answered ticket', () => {
    expect(activateTicketData(QuickQuestionStatus.answered, DUE_AT)).toBeNull();
  });

  it('never reopens a closed one either', () => {
    expect(activateTicketData(QuickQuestionStatus.closed, DUE_AT)).toBeNull();
  });
});
