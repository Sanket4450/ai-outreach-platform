import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v7 } from 'uuid';
import { WorkspaceInvitationsRepository } from './workspace-invitations-repository';
import { AuthRepository } from '../auth/auth-repository';
import { WorkspacesRepository } from '../workspaces/workspaces-repository';
import { AppError } from '../../errors/AppError';
import { ERROR_CODES } from '../../utils/error-codes';
import { STATUS_CODES } from '../../utils/status-codes';
import { MESSAGES } from '../../utils/messages';
import { BCRYPT_ROUNDS, INVITATION_EXPIRY_DAYS } from '../../utils/constants';
import type { CreateInvitationInput, RegisterFromInvitationInput } from '@repo/shared';

@Injectable()
export class WorkspaceInvitationsService {
  constructor(
    private readonly invitationsRepository: WorkspaceInvitationsRepository,
    private readonly authRepository: AuthRepository,
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createInvitation(input: CreateInvitationInput, workspaceId: string, createdBy: string) {
    // ensure creator is owner
    const membership = await this.workspacesRepository.findMembership({
      workspaceId,
      userId: createdBy,
    });

    if (!membership || membership.role !== 'owner') {
      throw new AppError(
        ERROR_CODES.NOT_WORKSPACE_OWNER,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.NOT_WORKSPACE_OWNER,
      );
    }

    const token = v7();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    await this.invitationsRepository.createInvitation({
      workspaceId,
      email: input.email,
      token,
      expiresAt,
      createdBy,
    });

    // TODO: send invitation email via emailProvider

    return { success: true };
  }

  async getInvitation(token: string) {
    const invitation = await this.invitationsRepository.findValidInvitation(token);

    if (!invitation) {
      return { valid: false, reason: 'invalid_or_expired' };
    }

    return {
      valid: true,
      workspaceId: invitation.workspaceId,
      email: invitation.email,
    };
  }

  async acceptInvitation(token: string, userId: string, userEmail: string) {
    const invitation = await this.invitationsRepository.findValidInvitation(token);

    if (!invitation) {
      throw new AppError(
        ERROR_CODES.INVITATION_INVALID_OR_EXPIRED,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.INVITATION_INVALID_OR_EXPIRED,
      );
    }

    if (invitation.email !== userEmail) {
      throw new AppError(
        ERROR_CODES.INVITATION_EMAIL_MISMATCH,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.INVITATION_EMAIL_MISMATCH.replace('{{email}}', invitation.email),
      );
    }

    const existingMembership = await this.invitationsRepository.findExistingMembership({
      workspaceId: invitation.workspaceId,
      userId,
    });

    if (existingMembership) {
      throw new AppError(
        ERROR_CODES.ALREADY_WORKSPACE_MEMBER,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.ALREADY_WORKSPACE_MEMBER,
      );
    }

    const member = await this.invitationsRepository.createMembership({
      workspaceId: invitation.workspaceId,
      userId,
      role: 'member',
    });

    await this.invitationsRepository.markAccepted(invitation.id);

    return {
      workspaceId: invitation.workspaceId,
      member,
    };
  }

  async registerFromInvitation(token: string, input: RegisterFromInvitationInput) {
    const invitation = await this.invitationsRepository.findValidInvitation(token);

    if (!invitation) {
      throw new AppError(
        ERROR_CODES.INVITATION_INVALID_OR_EXPIRED,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.INVITATION_INVALID_OR_EXPIRED,
      );
    }

    const existingUser = await this.authRepository.findUserByEmail(invitation.email);
    if (existingUser) {
      throw new AppError(
        ERROR_CODES.EMAIL_ALREADY_REGISTERED,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.EMAIL_ALREADY_REGISTERED,
      );
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await this.authRepository.createUser({
      email: invitation.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName ?? null,
    });

    await this.authRepository.verifyUserEmail(user.id);

    await this.invitationsRepository.createMembership({
      workspaceId: invitation.workspaceId,
      userId: user.id,
      role: 'member',
    });

    await this.invitationsRepository.markAccepted(invitation.id);

    const tokens = this.issueTokens(user.id, user.email);

    return {
      workspaceId: invitation.workspaceId,
      ...tokens,
    };
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: process.env['REFRESH_TOKEN_SECRET'],
      }),
    };
  }
}
