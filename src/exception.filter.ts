import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === 400) {
      const errorResponse = {
        errorsMessages: [],
      };
      const responseBody: any = exception.getResponse();
      if (typeof responseBody.message === 'string') {
        errorResponse.errorsMessages.push(responseBody);
      } else {
        responseBody.message.forEach((m) =>
          errorResponse.errorsMessages.push(m),
        );
      }
      response.status(status).json(errorResponse);
    } else if (status == 401) {
      response.sendStatus(status);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
