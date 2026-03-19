import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListNotasQueryDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  take?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  alumnoId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  cursoId?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @IsDateString()
  @IsOptional()
  fechaHasta?: string;
}
