import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListAsistenciasQueryDto } from './dto/list-asistencias.query.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

@Injectable()
export class AsistenciasService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAlumnoFromUser(userId: number) {
    const alumno = await this.prisma.alumno.findUnique({ where: { userId } });
    if (!alumno) throw new ForbiddenException('El usuario no tiene perfil de alumno vinculado');
    return alumno;
  }

  private async validateAlumnoCurso(alumnoId: number, cursoId: number) {
    const alumno = await this.prisma.alumno.findUnique({ where: { id: alumnoId } });
    if (!alumno) throw new BadRequestException('alumnoId invalido');

    const curso = await this.prisma.curso.findUnique({ where: { id: cursoId } });
    if (!curso) throw new BadRequestException('cursoId invalido');

    if (alumno.cursoId !== cursoId) {
      throw new BadRequestException('El alumno no pertenece al curso indicado');
    }
  }

  async create(dto: CreateAsistenciaDto) {
    await this.validateAlumnoCurso(dto.alumnoId, dto.cursoId);

    return this.prisma.asistencia.create({
      data: {
        fecha: new Date(dto.fecha),
        presente: dto.presente,
        observacion: dto.observacion,
        alumnoId: dto.alumnoId,
        cursoId: dto.cursoId,
      },
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async findAll(query: ListAsistenciasQueryDto | undefined, user: AuthUser) {
    const parsedSkip = Number(query?.skip);
    const parsedTake = Number(query?.take);

    const skip = Number.isFinite(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
    const take = Number.isFinite(parsedTake) && parsedTake >= 1
      ? Math.min(parsedTake, 100)
      : 50;

    const where: Prisma.AsistenciaWhereInput = {};

    if (user.role === Role.ALUMNO) {
      const alumno = await this.getAlumnoFromUser(user.userId);
      where.alumnoId = alumno.id;
    } else {
      if (query?.alumnoId) where.alumnoId = query.alumnoId;
      if (query?.cursoId) where.cursoId = query.cursoId;
      if (typeof query?.presente === 'boolean') where.presente = query.presente;
    }

    if (query?.fechaDesde || query?.fechaHasta) {
      where.fecha = {
        ...(query?.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
        ...(query?.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
      };
    }

    return this.prisma.asistencia.findMany({
      skip,
      take,
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      where,
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async findMine(userId: number) {
    const alumno = await this.getAlumnoFromUser(userId);
    return this.prisma.asistencia.findMany({
      where: { alumnoId: alumno.id },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async findOne(id: number, user: AuthUser) {
    const asistencia = await this.prisma.asistencia.findUnique({
      where: { id },
      include: {
        alumno: true,
        curso: true,
      },
    });

    if (!asistencia) throw new NotFoundException('Asistencia no encontrada');

    if (user.role === Role.ALUMNO) {
      const alumno = await this.getAlumnoFromUser(user.userId);
      if (asistencia.alumnoId !== alumno.id) {
        throw new ForbiddenException('No puedes acceder a asistencias de otros alumnos');
      }
    }

    return asistencia;
  }

  async update(id: number, dto: UpdateAsistenciaDto) {
    const existing = await this.prisma.asistencia.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asistencia no encontrada');

    const nextAlumnoId = dto.alumnoId ?? existing.alumnoId;
    const nextCursoId = dto.cursoId ?? existing.cursoId;
    await this.validateAlumnoCurso(nextAlumnoId, nextCursoId);

    return this.prisma.asistencia.update({
      where: { id },
      data: {
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        presente: dto.presente,
        observacion: dto.observacion,
        alumnoId: dto.alumnoId,
        cursoId: dto.cursoId,
      },
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.asistencia.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Asistencia no encontrada');

    return this.prisma.asistencia.delete({ where: { id } });
  }
}
