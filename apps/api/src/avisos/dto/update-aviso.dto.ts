import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAvisoDto {
  @IsString()
  @MaxLength(120)
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  contenido?: string;

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
