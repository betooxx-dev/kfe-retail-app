import {
    createParamDecorator,
    ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();

        if (!req.user) throw new InternalServerErrorException('User not found in request');

        if (data && !(data in req.user))
            throw new InternalServerErrorException('Property not found in user');

        return data ? req.user[data] : req.user;
    },
);