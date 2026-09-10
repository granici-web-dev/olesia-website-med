import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  /**
   * TOTP code or a recovery code, sent on the second call once the first one
   * answered `totp_required`. Optional so accounts without 2FA log in as before.
   */
  @IsOptional()
  @IsString()
  @Length(6, 20)
  totpCode?: string;
}

/** Body for enabling / disabling 2FA — always a fresh code from the app. */
export class TotpCodeDto {
  @IsString()
  @Length(6, 20)
  code!: string;
}

/**
 * Body for starting enrolment. The code is optional because it is only needed
 * when 2FA is already on: first-time enrolment has nothing to prove yet.
 */
export class OptionalTotpCodeDto {
  @IsOptional()
  @IsString()
  @Length(6, 20)
  code?: string;
}

/**
 * Changing one's own password. Twelve characters minimum: this is the only
 * credential on an account that reaches patient records, and the starter
 * password it replaces was chosen by somebody else.
 */
export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword!: string;

  @IsString()
  @MinLength(12)
  newPassword!: string;
}
