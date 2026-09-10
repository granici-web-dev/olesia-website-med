/**
 * The timezone field, which is the one input on this form that can take the
 * public site down.
 *
 * `Intl.DateTimeFormat` throws a `RangeError` on an unknown zone, and a
 * `RangeError` is not an HttpException — so a typo saved here used to turn
 * every EXPRESS submission into a 500 and lose the lead (audit A3, F8).
 */
// The only spec here that exercises decorators rather than a pure function,
// so it is the only one that needs the metadata shim Nest installs at boot.
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';

function errorsFor(payload: Record<string, unknown>): string[] {
  return validateSync(plainToInstance(UpdateWorkingHoursDto, payload)).map(
    (e) => e.property,
  );
}

describe('UpdateWorkingHoursDto.timezone', () => {
  it('accepts the practice zone', () => {
    expect(errorsFor({ timezone: 'Europe/Chisinau' })).toEqual([]);
  });

  it('rejects the typo that used to reach the SLA arithmetic', () => {
    expect(errorsFor({ timezone: 'Europe/Chisinauu' })).toEqual(['timezone']);
  });

  it('rejects anything that is not an IANA zone', () => {
    for (const timezone of ['', 'UTC+2', 'Chisinau', 'not a zone']) {
      expect(errorsFor({ timezone })).toEqual(['timezone']);
    }
  });

  it('is optional — a payload that only changes the hours is valid', () => {
    expect(errorsFor({ expressSlaMinutes: 60 })).toEqual([]);
  });
});
