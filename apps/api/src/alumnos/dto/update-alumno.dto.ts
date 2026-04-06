import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateAlumnoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  cursoId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  userId?: number;
}