import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AvisosController } from './avisos.controller';
import { AvisosService } from './avisos.service';

@Module({
  imports: [PrismaModule],
  controllers: [AvisosController],
  providers: [AvisosService],
})
export class AvisosModule {}
