import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAsistenciaDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  presente?: boolean;

  @IsString()
  @IsOptional()
  observacion?: string;

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
}
