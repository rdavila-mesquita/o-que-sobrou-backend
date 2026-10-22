import type { Request } from "express";

export interface AuthenticatedUser {
  sub: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}
