import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { formatDate } from '../utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const logger = new Logger('MiddlewareLogger');

        const { method, originalUrl: url, ip } = req;
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length') || 0;
            const responseTime = Date.now() - start;
            const timestamp = formatDate(new Date());

            logger.log(
                `[${timestamp}] ${method} ${url} - Status: ${statusCode} - Content-Length: ${contentLength} bytes - Response Time: ${responseTime} ms - Client IP: ${ip}`,
            );
        });

        next();
    }
}
