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

      responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));
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

    // switch (status) {
    //   case 400:
    //     const errorResponse = {
    //       errors: [],
    //     };
    //     const responseBody: any = exception.getResponse();
    //
    //     responseBody.message.forEach((m) => errorResponse.errors.push(m));
    //     response.status(status).json(errorResponse);
    //     break;
    //   case 404:
    //     response.status(404);
    //     break;
    //   default:
    //     response.status(status).json({
    //       statusCode: status,
    //       timestamp: new Date().toISOString(),
    //       path: request.url,
    //     });
    // }
  }
}
