import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  contenido!: string;

  @IsOptional()
  @IsInt()
  cursoId?: number;

  @IsOptional()
  @IsInt()
  destinatarioId?: number;

  @IsOptional()
  @IsInt()
  padreId?: number;

  @IsOptional()
  @IsBoolean()
  soloProfesor?: boolean;
}
