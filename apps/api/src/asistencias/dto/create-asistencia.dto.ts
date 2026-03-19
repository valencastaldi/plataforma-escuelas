import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateAsistenciaDto {
  @IsDateString()
  fecha!: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  presente?: boolean;

  @IsString()
  @IsOptional()
  observacion?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  alumnoId!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  cursoId!: number;
}
