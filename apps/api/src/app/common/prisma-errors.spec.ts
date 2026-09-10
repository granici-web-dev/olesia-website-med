/**
 * Four writes answered 500 before 2026-09-10 (audit A4, F9/F10/F11/F13): a
 * taken slug, a taken Calendly event type, a service still carrying
 * appointments, and a post pointing at a category somebody had deleted. A 500
 * tells the caller nothing and sends an operator looking for a bug that is not
 * there. The table below is the whole mapping.
 */
import { ConflictException, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client';
import { translatePrismaError } from './prisma-errors';

function prismaError(
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('db said no', {
    code,
    clientVersion: '7.8.0',
    meta,
  });
}

/** How the pg driver adapter reports it: nested, and never in `target`. */
const adapter = (constraint: { fields?: string[]; index?: string }) => ({
  modelName: 'Post',
  driverAdapterError: {
    name: 'DriverAdapterError',
    cause: { kind: 'UniqueConstraintViolation', constraint },
  },
});

describe('the answer a database error becomes', () => {
  it.each([
    ['P2002', { target: ['slug'] }, 409, 'slug_taken'],
    ['P2002', { target: 'Material_slug_key' }, 409, 'slug_taken'],
    ['P2002', adapter({ fields: ['slug'] }), 409, 'slug_taken'],
    ['P2002', adapter({ index: 'Post_slug_key' }), 409, 'slug_taken'],
    [
      // Quoted, because Postgres quotes an identifier that is not lowercase.
      'P2002',
      adapter({ fields: ['"calendlyEventTypeUri"'] }),
      409,
      'calendly_event_type_taken',
    ],
    [
      'P2002',
      adapter({ index: 'Service_calendlyEventTypeUri_key' }),
      409,
      'calendly_event_type_taken',
    ],
    ['P2002', { target: ['email'] }, 409, 'email_taken'],
    ['P2002', adapter({ fields: ['code'] }), 409, 'code_taken'],
    ['P2002', { target: ['sortOrder'] }, 409, 'unique_violation'],
    ['P2002', undefined, 409, 'unique_violation'],
    ['P2003', undefined, 409, 'in_use'],
    ['P2025', undefined, 404, 'not_found'],
  ] as const)('%s on %p becomes %i %s', (code, meta, status, message) => {
    const answer = translatePrismaError(prismaError(code, meta));
    expect(answer?.getStatus()).toBe(status);
    expect(answer?.message).toBe(message);
  });

  it('returns the right exception classes', () => {
    expect(
      translatePrismaError(prismaError('P2002', { target: ['slug'] })),
    ).toBeInstanceOf(ConflictException);
    expect(translatePrismaError(prismaError('P2025'))).toBeInstanceOf(
      NotFoundException,
    );
  });

  it('leaves an error it has nothing to say about alone', () => {
    expect(translatePrismaError(prismaError('P2011'))).toBeNull();
    expect(translatePrismaError(new Error('socket hang up'))).toBeNull();
  });
});
