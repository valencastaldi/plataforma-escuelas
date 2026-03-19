import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';

@Injectable()
export class CursosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCursoDto) {
    return this.prisma.curso.create({ data: { nombre: dto.nombre } });
  }

  findAll() {
    return this.prisma.curso.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({ where: { id } });
    if (!curso) throw new NotFoundException('Curso no encontrado');
    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);
    return this.prisma.curso.update({
      where: { id },
      data: { nombre: dto.nombre },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.curso.delete({ where: { id } });
  }
}