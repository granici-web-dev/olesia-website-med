import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TotpModule } from './totp.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({}), UsersModule, TotpModule],
  controllers: [AuthController],
  // JwtAuthGuard and RolesGuard live under this module but are registered
  // globally in AppModule, where the order of all three guards is decided in
  // one place (audit A5, F15).
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
