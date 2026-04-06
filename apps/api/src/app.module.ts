import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CursosModule } from './cursos/cursos.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { AuthModule } from './auth/auth.module';
import { NotasModule } from './notas/notas.module';
import { AsistenciasModule } from './asistencias/asistencias.module';
import { AvisosModule } from './avisos/avisos.module';
import { MensajesModule } from './mensajes/mensajes.module';

@Module({
  imports: [PrismaModule, CursosModule, AlumnosModule, AuthModule, NotasModule, AsistenciasModule, AvisosModule, MensajesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
