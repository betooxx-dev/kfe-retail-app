import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(
        ctx: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles = this.reflector.get<string[]>(META_ROLES, ctx.getHandler());

        if (!validRoles) return true;
        if (validRoles.length === 0) return true;

        const req = ctx.switchToHttp().getRequest();

        if (!req.user) throw new BadRequestException('User not found in request');

        if (!validRoles.includes(req.user.role))
            throw new ForbiddenException(
                `Access denied. User role '${req.user.role}' is not allowed. Required roles: [${validRoles.join(', ')}]`,
            );

        return true;
    }
}