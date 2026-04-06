import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user.type';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { MensajesService } from './mensajes.service';

@ApiTags('mensajes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mensajes')
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Get()
  getMensajes(@Req() req: { user: AuthUser }) {
    return this.mensajesService.getMensajes(req.user.userId, req.user.role);
  }

  @Post()
  createMensaje(@Req() req: { user: AuthUser }, @Body() dto: CreateMensajeDto) {
    return this.mensajesService.createMensaje(req.user.userId, req.user.role, dto);
  }

  @Delete(':id')
  deleteMensaje(@Req() req: { user: AuthUser }, @Param('id', ParseIntPipe) id: number) {
    return this.mensajesService.deleteMensaje(req.user.userId, id);
  }
}
