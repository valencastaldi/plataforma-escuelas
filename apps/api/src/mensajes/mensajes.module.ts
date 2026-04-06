import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MensajesController } from './mensajes.controller';
import { MensajesService } from './mensajes.service';

@Module({
  imports: [PrismaModule],
  controllers: [MensajesController],
  providers: [MensajesService],
})
export class MensajesModule {}
