import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

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
  @IsString()
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

  @IsOptional()
  @IsBoolean()
  isPlaceholder?: boolean;
}
