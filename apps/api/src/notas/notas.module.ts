import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotasController } from './notas.controller';
import { NotasService } from './notas.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotasController],
  providers: [NotasService],
})
export class NotasModule {}
