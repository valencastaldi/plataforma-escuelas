import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const role = dto.role ?? Role.ALUMNO;

    if (!dto.email && !dto.username) {
      throw new BadRequestException('Debes enviar email o username');
    }

    if (role === Role.ALUMNO && (!dto.nombre || !dto.cursoId)) {
      throw new BadRequestException('Para rol ALUMNO debes enviar nombre y cursoId');
    }

    if (dto.email) {
      const existingByEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingByEmail) throw new BadRequestException('Email ya registrado');
    }

    if (dto.username) {
      const existingByUsername = await this.prisma.user.findUnique({ where: { username: dto.username } });
      if (existingByUsername) throw new BadRequestException('Username ya registrado');
    }

    if (dto.dni) {
      const existingByDni = await this.prisma.alumno.findUnique({ where: { dni: dto.dni } });
      if (existingByDni) throw new BadRequestException('DNI ya registrado');
    }

    if (role === Role.ALUMNO) {
      const curso = await this.prisma.curso.findUnique({ where: { id: dto.cursoId } });
      if (!curso) throw new BadRequestException('cursoId inválido');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          passwordHash,
          role,
        },
      });

      if (role === Role.ALUMNO) {
        await tx.alumno.create({
          data: {
            nombre: dto.nombre!,
            apellido: dto.apellido,
            dni: dto.dni,
            fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : undefined,
            curso: { connect: { id: dto.cursoId! } },
            user: { connect: { id: createdUser.id } },
          },
        });
      }

      return createdUser;
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        alumno: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            dni: true,
            fechaNacimiento: true,
            cursoId: true,
            curso: { select: { id: true, nombre: true } },
          },
        },
      },
    });
    return users;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { username: dto.identifier }],
      },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    const payload: JwtPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
