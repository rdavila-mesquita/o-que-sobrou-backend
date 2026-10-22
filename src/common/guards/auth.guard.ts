import { Inject, Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { jwtConstants } from "../../auth/constants";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { AuthenticatedRequest } from "../../auth/types/authenticated-request";
import type { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if(isPublic) return true;
    
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromHeader(request);

    if(!token){
      throw new UnauthorizedException("Access token not found");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret
      })

      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException("Access token not found");
    }

    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
