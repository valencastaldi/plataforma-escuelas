import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotaDto } from './dto/create-nota.dto';
import { ListNotasQueryDto } from './dto/list-notas.query.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';

@Injectable()
export class NotasService {
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

  async create(dto: CreateNotaDto) {
    await this.validateAlumnoCurso(dto.alumnoId, dto.cursoId);

    return this.prisma.nota.create({
      data: {
        valor: dto.valor,
        descripcion: dto.descripcion,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
        alumnoId: dto.alumnoId,
        cursoId: dto.cursoId,
      },
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async findAll(query: ListNotasQueryDto | undefined, user: AuthUser) {
    const parsedSkip = Number(query?.skip);
    const parsedTake = Number(query?.take);

    const skip = Number.isFinite(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
    const take = Number.isFinite(parsedTake) && parsedTake >= 1
      ? Math.min(parsedTake, 100)
      : 50;

    const where: Prisma.NotaWhereInput = {};

    if (user.role === Role.ALUMNO) {
      const alumno = await this.getAlumnoFromUser(user.userId);
      where.alumnoId = alumno.id;
    } else {
      if (query?.alumnoId) where.alumnoId = query.alumnoId;
      if (query?.cursoId) where.cursoId = query.cursoId;
      if (query?.descripcion) where.descripcion = { contains: query.descripcion.trim() };
    }

    if (query?.fechaDesde || query?.fechaHasta) {
      where.fecha = {
        ...(query?.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
        ...(query?.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
      };
    }

    return this.prisma.nota.findMany({
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
    return this.prisma.nota.findMany({
      where: { alumnoId: alumno.id },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
      include: {
        alumno: true,
        curso: true,
      },
    });
  }

  async findOne(id: number, user: AuthUser) {
    const nota = await this.prisma.nota.findUnique({
      where: { id },
      include: {
        alumno: true,
        curso: true,
      },
    });

    if (!nota) throw new NotFoundException('Nota no encontrada');

    if (user.role === Role.ALUMNO) {
      const alumno = await this.getAlumnoFromUser(user.userId);
      if (nota.alumnoId !== alumno.id) {
        throw new ForbiddenException('No puedes acceder a notas de otros alumnos');
      }
    }

    return nota;
  }

  async update(id: number, dto: UpdateNotaDto) {
    const existing = await this.prisma.nota.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Nota no encontrada');

    const nextAlumnoId = dto.alumnoId ?? existing.alumnoId;
    const nextCursoId = dto.cursoId ?? existing.cursoId;
    await this.validateAlumnoCurso(nextAlumnoId, nextCursoId);

    return this.prisma.nota.update({
      where: { id },
      data: {
        valor: dto.valor,
        descripcion: dto.descripcion,
        fecha: dto.fecha ? new Date(dto.fecha) : undefined,
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
    const existing = await this.prisma.nota.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Nota no encontrada');

    return this.prisma.nota.delete({ where: { id } });
  }
}
