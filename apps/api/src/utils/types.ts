import type { Request } from 'express';

export interface UserRequest extends Request {
  user: { userId: string; email: string };
}

export interface WorkspaceRequest extends UserRequest {
  workspaceId: string;
}
