import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  checkEmailSchema,
  loginSchema,
  registerUserSchema,
  verifyEmailSchema,
  resendVerificationEmailSchema,
} from '@repo/shared';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-email')
  async checkEmail(@Body() body: unknown) {
    const input = checkEmailSchema.parse(body);
    return this.authService.checkEmail(input);
  }

  @Post('register')
  async register(@Body() body: unknown) {
    const input = registerUserSchema.parse(body);
    return this.authService.register(input);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: unknown) {
    const input = verifyEmailSchema.parse(body);
    return this.authService.verifyEmail(input);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() body: unknown) {
    const input = resendVerificationEmailSchema.parse(body);
    return this.authService.resendVerificationEmail(input);
  }

  @Post('login')
  async login(@Body() body: unknown) {
    const input = loginSchema.parse(body);
    return this.authService.login(input);
  }
}
