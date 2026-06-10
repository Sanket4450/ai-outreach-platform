import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { AuthRepository } from './auth-repository';
import { OtpRepository } from './otp-repository';
import { AppError } from '../../errors/AppError';
import {
  type CheckEmailInput,
  type RegisterUserInput,
  type VerifyEmailInput,
  type ResendVerificationEmailInput,
  type LoginInput,
  ERROR_CODES,
  STATUS_CODES,
  MESSAGES,
  OTP_EXPIRY_MINUTES,
  BCRYPT_ROUNDS,
} from '@repo/shared';
import { env } from '@/config/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly otpRepository: OtpRepository,
    private readonly jwtService: JwtService,
  ) {}

  async checkEmail(input: CheckEmailInput) {
    const user = await this.authRepository.findUserByEmail(input.email);
    return { exists: user !== null };
  }

  async register(input: RegisterUserInput) {
    const existingUser = await this.authRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new AppError(
        ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.EMAIL_ALREADY_REGISTERED,
      );
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await this.authRepository.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
    });

    await this.generateAndStoreOtp(input.email);

    return { userId: user.id };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.USER_NOT_FOUND,
      );
    }

    if (user.isEmailVerified) {
      throw new AppError(
        ERROR_CODES.EMAIL_ALREADY_VERIFIED,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.EMAIL_ALREADY_VERIFIED,
      );
    }

    const otpRecord = await this.otpRepository.findValidOtp({
      email: input.email,
      otp: input.otp,
    });

    if (!otpRecord) {
      throw new AppError(
        ERROR_CODES.INVALID_OR_EXPIRED_OTP,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.INVALID_OR_EXPIRED_OTP,
      );
    }

    await this.authRepository.verifyUserEmail(user.id);
    await this.otpRepository.invalidateByEmail(input.email);

    const tokens = this.issueTokens(user.id, user.email);

    return tokens;
  }

  async resendVerificationEmail(input: ResendVerificationEmailInput) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.USER_NOT_FOUND,
      );
    }

    if (user.isEmailVerified) {
      throw new AppError(
        ERROR_CODES.EMAIL_ALREADY_VERIFIED,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.EMAIL_ALREADY_VERIFIED,
      );
    }

    await this.otpRepository.invalidateByEmail(input.email);
    await this.generateAndStoreOtp(input.email);

    return { success: true };
  }

  async login(input: LoginInput) {
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
        MESSAGES.error.INVALID_CREDENTIALS,
      );
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
        MESSAGES.error.INVALID_CREDENTIALS,
      );
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        ERROR_CODES.EMAIL_NOT_VERIFIED,
        STATUS_CODES.UNAUTHORIZED,
        MESSAGES.error.EMAIL_NOT_VERIFIED,
      );
    }

    const tokens = this.issueTokens(user.id, user.email);

    return tokens;
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as never,
        secret: env.REFRESH_TOKEN_SECRET,
      }),
    };
  }

  private async generateAndStoreOtp(email: string) {
    const otp = randomInt(100000, 999999).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.otpRepository.create({ email, otp, expiresAt });

    // TODO: send OTP email via emailProvider
  }
}
