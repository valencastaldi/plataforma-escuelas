import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class ListAsistenciasQueryDto {
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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  presente?: boolean;

  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @IsDateString()
  @IsOptional()
  fechaHasta?: string;
}
