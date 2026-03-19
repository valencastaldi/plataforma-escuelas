import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { ListAsistenciasQueryDto } from './dto/list-asistencias.query.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';

@ApiTags('asistencias')
@ApiBearerAuth()
@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  @Roles(Role.DOCENTE)
  @Post()
  create(@Body() dto: CreateAsistenciaDto) {
    return this.asistenciasService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListAsistenciasQueryDto, @Req() req: { user: AuthUser }) {
    return this.asistenciasService.findAll(query, req.user);
  }

  @Get('mias')
  findMine(@Req() req: { user: AuthUser }) {
    return this.asistenciasService.findMine(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: AuthUser }) {
    return this.asistenciasService.findOne(id, req.user);
  }

  @Roles(Role.DOCENTE)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAsistenciaDto) {
    return this.asistenciasService.update(id, dto);
  }

  @Roles(Role.DOCENTE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asistenciasService.remove(id);
  }
}
