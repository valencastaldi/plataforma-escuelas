import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser } from '../auth/types/auth-user.type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { ListAvisosQueryDto } from './dto/list-avisos.query.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private readonly prisma: PrismaService) {}

  private get prismaClient(): any {
    return this.prisma as any;
  }

  create(dto: CreateAvisoDto) {
    return this.prismaClient.aviso.create({
      data: {
        titulo: dto.titulo,
        contenido: dto.contenido,
        categoria: dto.categoria,
        publicadoDesde: dto.publicadoDesde ? new Date(dto.publicadoDesde) : undefined,
        activo: dto.activo,
      },
    });
  }

  findAll(query: ListAvisosQueryDto | undefined, user: AuthUser) {
    const parsedSkip = Number(query?.skip);
    const parsedTake = Number(query?.take);

    const skip = Number.isFinite(parsedSkip) && parsedSkip >= 0 ? parsedSkip : 0;
    const take = Number.isFinite(parsedTake) && parsedTake >= 1
      ? Math.min(parsedTake, 100)
      : 20;

    const where: Record<string, unknown> = {};

    if (user.role === Role.ALUMNO) {
      where.activo = true;
      where.publicadoDesde = { lte: new Date() };
    } else if (typeof query?.activo === 'boolean') {
      where.activo = query.activo;
    }

    return this.prismaClient.aviso.findMany({
      skip,
      take,
      where,
      orderBy: [{ publicadoDesde: 'desc' }, { id: 'desc' }],
    });
  }

  async findOne(id: number, user: AuthUser) {
    const aviso = await this.prismaClient.aviso.findUnique({ where: { id } });
    if (!aviso) throw new NotFoundException('Aviso no encontrado');

    if (user.role === Role.ALUMNO) {
      if (!aviso.activo || aviso.publicadoDesde > new Date()) {
        throw new NotFoundException('Aviso no encontrado');
      }
    }

    return aviso;
  }

  async update(id: number, dto: UpdateAvisoDto) {
    const existing = await this.prismaClient.aviso.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Aviso no encontrado');

    return this.prismaClient.aviso.update({
      where: { id },
      data: {
        titulo: dto.titulo,
        contenido: dto.contenido,
        categoria: dto.categoria,
        publicadoDesde: dto.publicadoDesde ? new Date(dto.publicadoDesde) : undefined,
        activo: dto.activo,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prismaClient.aviso.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Aviso no encontrado');

    return this.prismaClient.aviso.delete({ where: { id } });
  }
}
