import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppError } from '../errors/AppError';
import { Request } from 'express';
import { ERROR_CODES, MESSAGES, STATUS_CODES } from '@repo/shared';

@Injectable()
export class WorkspaceIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request & { workspaceId: string } = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new AppError(
        ERROR_CODES.MISSING_WORKSPACE_ID,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.MISSING_WORKSPACE_ID,
      );
    }

    request.workspaceId = workspaceId;
    return true;
  }
}
