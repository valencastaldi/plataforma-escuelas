import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CursosModule } from './cursos/cursos.module';
import { AlumnosModule } from './alumnos/alumnos.module';
import { AuthModule } from './auth/auth.module';
import { NotasModule } from './notas/notas.module';
import { AsistenciasModule } from './asistencias/asistencias.module';

@Module({
  imports: [PrismaModule, CursosModule, AlumnosModule, AuthModule, NotasModule, AsistenciasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
