import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateNotaDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  valor?: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

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
