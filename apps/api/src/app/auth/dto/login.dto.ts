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
