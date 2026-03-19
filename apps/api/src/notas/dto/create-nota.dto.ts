import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateNotaDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  valor!: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  alumnoId!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cursoId!: number;
}
