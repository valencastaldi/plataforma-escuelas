import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { CreateNotaDto } from './dto/create-nota.dto';
import { ListNotasQueryDto } from './dto/list-notas.query.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { NotasService } from './notas.service';

@ApiTags('notas')
@ApiBearerAuth()
@Controller('notas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Roles(Role.DOCENTE)
  @Post()
  create(@Body() dto: CreateNotaDto) {
    return this.notasService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListNotasQueryDto, @Req() req: { user: AuthUser }) {
    return this.notasService.findAll(query, req.user);
  }

  @Get('mias')
  findMine(@Req() req: { user: AuthUser }) {
    return this.notasService.findMine(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: AuthUser }) {
    return this.notasService.findOne(id, req.user);
  }

  @Roles(Role.DOCENTE)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotaDto) {
    return this.notasService.update(id, dto);
  }

  @Roles(Role.DOCENTE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notasService.remove(id);
  }
}
