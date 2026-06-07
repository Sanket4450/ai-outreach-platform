import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '../../config/env';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth-repository';
import { OtpRepository } from './otp-repository';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    PassportModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN as never },
    }),
  ],
  providers: [AuthService, AuthRepository, OtpRepository, JwtStrategy],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
