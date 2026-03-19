import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Defaults
    let status = HttpStatus.BAD_REQUEST;
    let message = 'Error de base de datos';

    // https://www.prisma.io/docs/reference/api-reference/error-reference
    switch (exception.code) {
      case 'P2002': // Unique constraint failed
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con ese valor único';
        break;

      case 'P2003': // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        message = 'Referencia inválida (FK). Verificá IDs relacionados';
        break;

      case 'P2025': // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Registro no encontrado';
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      prisma: {
        code: exception.code,
        meta: exception.meta,
      },
    });
  }
}