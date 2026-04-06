import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { ListAlumnosQueryDto } from './dto/list-alumnos.query.dto';

@Injectable()
export class AlumnosService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeNombre(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private async ensureUniqueNombreInCurso(nombre: string, cursoId: number, excludeAlumnoId?: number) {
    const alumnos = await this.prisma.alumno.findMany({
      where: {
        cursoId,
        ...(excludeAlumnoId ? { NOT: { id: excludeAlumnoId } } : {}),
      },
      select: { id: true, nombre: true },
    });

    const normalizedNombre = this.normalizeNombre(nombre);
    const duplicate = alumnos.find((alumno) => this.normalizeNombre(alumno.nombre) === normalizedNombre);

    if (duplicate) {
      throw new BadRequestException('Ya existe un alumno con nombre equivalente en este curso');
    }
  }

  private async ensureValidUserLink(userId: number, excludeAlumnoId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { alumno: true },
    });

    if (!user) {
      throw new BadRequestException('userId inválido');
    }

    if (user.role !== 'ALUMNO') {
      throw new BadRequestException('El usuario vinculado debe tener rol ALUMNO');
    }

    if (user.alumno && user.alumno.id !== excludeAlumnoId) {
      throw new BadRequestException('El usuario ya está vinculado a otro alumno');
    }
  }

  async create(dto: CreateAlumnoDto) {
    const curso = await this.prisma.curso.findUnique({ where: { id: dto.cursoId } });
    if (!curso) throw new BadRequestException('cursoId inválido');

    await this.ensureUniqueNombreInCurso(dto.nombre, dto.cursoId);
    await this.ensureValidUserLink(dto.userId);

    return this.prisma.alumno.create({
      data: {
        nombre: dto.nombre,
        cursoId: dto.cursoId,
        userId: dto.userId,
      },
      include: {
        curso: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });
  }

  findAll(query?: ListAlumnosQueryDto) {
    const parsedSkip = Number(query?.skip);
    const parsedTake = Number(query?.take);
    const parsedCursoId = Number(query?.cursoId);
    const q = typeof query?.q === 'string' ? query.q.trim() : undefined;

    const skip = Number.isFinite(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
    const take = Number.isFinite(parsedTake) && parsedTake >= 1
      ? Math.min(parsedTake, 100)
      : 50; // límite máximo 100

    return this.prisma.alumno.findMany({
      skip,
      take,
      orderBy: { id: 'asc' },
      include: {
        curso: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
      where: {
        ...(Number.isFinite(parsedCursoId) && parsedCursoId >= 1 ? { cursoId: parsedCursoId } : {}),
        ...(q ? { nombre: { contains: q } } : {}),
      },
    });
  }

  async findOne(id: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      include: {
        curso: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    return alumno;
  }

  async update(id: number, dto: UpdateAlumnoDto) {
    const exists = await this.prisma.alumno.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Alumno no encontrado');

    const nextCursoId = dto.cursoId ?? exists.cursoId;
    const nextNombre = dto.nombre ?? exists.nombre;
    const nextUserId = dto.userId ?? exists.userId;

    if (dto.cursoId) {
      const curso = await this.prisma.curso.findUnique({ where: { id: dto.cursoId } });
      if (!curso) throw new BadRequestException('cursoId inválido');
    }

    await this.ensureUniqueNombreInCurso(nextNombre, nextCursoId, id);
    await this.ensureValidUserLink(nextUserId, id);

    return this.prisma.alumno.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        cursoId: dto.cursoId,
        userId: dto.userId,
      },
      include: {
        curso: true,
        user: {
          select: { id: true, email: true, username: true },
        },
      },
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.alumno.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Alumno no encontrado');

    return this.prisma.alumno.delete({ where: { id } });
  }
}