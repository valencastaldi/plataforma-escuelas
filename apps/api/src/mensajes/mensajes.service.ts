import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMensajeDto } from './dto/create-mensaje.dto';

const autorSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
} as const;

const cursoSelect = { id: true, nombre: true } as const;
const destinatarioSelect = { id: true, username: true, email: true } as const;

@Injectable()
export class MensajesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMensajes(userId: number, role: Role) {
    if (role === Role.DOCENTE) {
      return this.prisma.mensaje.findMany({
        where: {
          padreId: null,
          OR: [{ autorId: userId }, { destinatarioId: userId }],
        },
        include: {
          autor: { select: autorSelect },
          curso: { select: cursoSelect },
          destinatario: { select: destinatarioSelect },
          respuestas: {
            include: { autor: { select: autorSelect } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // ALUMNO
    const alumno = await this.prisma.alumno.findUnique({ where: { userId } });
    if (!alumno) return [];

    return this.prisma.mensaje.findMany({
      where: {
        padreId: null,
        OR: [{ cursoId: alumno.cursoId }, { destinatarioId: userId }],
      },
      include: {
        autor: { select: autorSelect },
        curso: { select: cursoSelect },
        destinatario: { select: destinatarioSelect },
        respuestas: {
          where: {
            OR: [{ soloProfesor: false }, { autorId: userId }],
          },
          include: { autor: { select: autorSelect } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMensaje(userId: number, role: Role, dto: CreateMensajeDto) {
    if (role === Role.DOCENTE) {
      if (dto.padreId !== undefined) {
        throw new BadRequestException('Un docente no puede usar padreId');
      }
      if (!dto.cursoId && !dto.destinatarioId) {
        throw new BadRequestException('Debes especificar cursoId o destinatarioId');
      }

      return this.prisma.mensaje.create({
        data: {
          contenido: dto.contenido,
          autorId: userId,
          cursoId: dto.cursoId,
          destinatarioId: dto.destinatarioId,
          soloProfesor: false,
        },
        include: {
          autor: { select: autorSelect },
          curso: { select: cursoSelect },
          destinatario: { select: destinatarioSelect },
          respuestas: { include: { autor: { select: autorSelect } } },
        },
      });
    }

    // ALUMNO: solo puede responder
    if (dto.padreId === undefined) {
      throw new BadRequestException('Un alumno solo puede responder mensajes existentes');
    }

    const padre = await this.prisma.mensaje.findUnique({ where: { id: dto.padreId } });
    if (!padre) throw new NotFoundException('Mensaje padre no encontrado');

    const alumno = await this.prisma.alumno.findUnique({ where: { userId } });
    const puedeResponder =
      padre.cursoId === alumno?.cursoId || padre.destinatarioId === userId;
    if (!puedeResponder) throw new ForbiddenException('No tienes acceso a este mensaje');

    return this.prisma.mensaje.create({
      data: {
        contenido: dto.contenido,
        autorId: userId,
        padreId: dto.padreId,
        soloProfesor: dto.soloProfesor ?? false,
      },
      include: {
        autor: { select: autorSelect },
      },
    });
  }

  async deleteMensaje(userId: number, id: number) {
    const mensaje = await this.prisma.mensaje.findUnique({ where: { id } });
    if (!mensaje) throw new NotFoundException('Mensaje no encontrado');
    if (mensaje.autorId !== userId) {
      throw new ForbiddenException('No puedes eliminar este mensaje');
    }
    return this.prisma.mensaje.delete({ where: { id } });
  }
}
