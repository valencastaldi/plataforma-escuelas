import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { ListAlumnosQueryDto } from './dto/list-alumnos.query.dto';

@Injectable()
export class AlumnosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlumnoDto) {
    const curso = await this.prisma.curso.findUnique({ where: { id: dto.cursoId } });
    if (!curso) throw new BadRequestException('cursoId inválido');

    return this.prisma.alumno.create({
      data: {
        nombre: dto.nombre,
        cursoId: dto.cursoId,
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
      include: { curso: true },
      where: {
        ...(Number.isFinite(parsedCursoId) && parsedCursoId >= 1 ? { cursoId: parsedCursoId } : {}),
        ...(q ? { nombre: { contains: q } } : {}),
      },
    });
  }

  async findOne(id: number) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id },
      include: { curso: true },
    });
    if (!alumno) throw new NotFoundException('Alumno no encontrado');
    return alumno;
  }

  async update(id: number, dto: UpdateAlumnoDto) {
    const exists = await this.prisma.alumno.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Alumno no encontrado');

    if (dto.cursoId) {
      const curso = await this.prisma.curso.findUnique({ where: { id: dto.cursoId } });
      if (!curso) throw new BadRequestException('cursoId inválido');
    }

    return this.prisma.alumno.update({
      where: { id },
      data: {
        nombre: dto.nombre,
        cursoId: dto.cursoId,
      },
      include: { curso: true },
    });
  }

  async remove(id: number) {
    const exists = await this.prisma.alumno.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Alumno no encontrado');

    return this.prisma.alumno.delete({ where: { id } });
  }
}