import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { ListAvisosQueryDto } from './dto/list-avisos.query.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@ApiTags('avisos')
@ApiBearerAuth()
@Controller('avisos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Roles(Role.DOCENTE)
  @Post()
  create(@Body() dto: CreateAvisoDto) {
    return this.avisosService.create(dto);
  }

  @Get()
  findAll(@Query() query: ListAvisosQueryDto, @Req() req: { user: AuthUser }) {
    return this.avisosService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: AuthUser }) {
    return this.avisosService.findOne(id, req.user);
  }

  @Roles(Role.DOCENTE)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAvisoDto) {
    return this.avisosService.update(id, dto);
  }

  @Roles(Role.DOCENTE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.avisosService.remove(id);
  }
}
