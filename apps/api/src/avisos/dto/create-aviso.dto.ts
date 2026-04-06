import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAvisoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  contenido!: string;

  @IsIn(['INSTITUCIONAL', 'ADMINISTRATIVO', 'ACADEMICO'])
  @IsOptional()
  categoria?: 'INSTITUCIONAL' | 'ADMINISTRATIVO' | 'ACADEMICO';

  @IsDateString()
  @IsOptional()
  publicadoDesde?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
