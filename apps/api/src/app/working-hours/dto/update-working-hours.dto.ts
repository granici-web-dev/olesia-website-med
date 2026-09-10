import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * The zones this runtime's ICU actually knows. Checked here rather than
 * trusted, because an unknown zone does not degrade — `Intl.DateTimeFormat`
 * throws a `RangeError`, which is not an HttpException, so a single typo in
 * the back office turned every public EXPRESS submission into a 500 and lost
 * the lead (audit A3, F8).
 */
const IANA_TIME_ZONES = Intl.supportedValuesOf('timeZone');

export class WorkingDayInput {
  @IsInt()
  @Min(1)
  @Max(7)
  weekday!: number;

  @IsBoolean()
  closed!: boolean;

  /** "HH:MM", 24-hour. Validated here so a typo cannot reach the SLA math. */
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  opensAt!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  closesAt!: string;
}

export class UpdateWorkingHoursDto {
  /** IANA zone, e.g. "Europe/Chisinau". */
  @IsOptional()
  // The default `IsIn` message lists every accepted value, which here is 400+
  // zone names in the response body of a typo. Say what is wrong instead.
  @IsIn(IANA_TIME_ZONES, {
    message: 'timezone must be a valid IANA zone, e.g. Europe/Chisinau',
  })
  timezone?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => WorkingDayInput)
  days?: WorkingDayInput[];

  /**
   * Working minutes for the EXPRESS promise. Capped at a week of working time
   * — anything larger is a typo, and it would be a deadline nobody reads.
   */
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60 * 24 * 7)
  expressSlaMinutes?: number;

  // `isPlaceholder` is deliberately absent: it is derived from saving a real
  // schedule, never sent (audit A5, F5). With the global ValidationPipe's
  // `forbidNonWhitelisted`, a request that still sends it gets a 400 saying so
  // rather than being quietly ignored.
}
