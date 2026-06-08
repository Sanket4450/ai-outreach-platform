import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../utils/error-codes';
import { STATUS_CODES } from '../utils/status-codes';
import { MESSAGES } from '../utils/messages';
import { Request } from 'express';

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
