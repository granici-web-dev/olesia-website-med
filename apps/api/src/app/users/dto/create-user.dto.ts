import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

import { Role } from '../../../generated/prisma/enums';

/**
 * A new back-office account, created by an admin (registration is closed).
 *
 * The upper bounds are the ones that were missing (audit A5, F6): 254 is the
 * longest address SMTP will carry, and the password ceiling matters because
 * argon2 hashes whatever it is handed — an unbounded one is CPU time an
 * attacker chooses.
 */
export class CreateUserDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
