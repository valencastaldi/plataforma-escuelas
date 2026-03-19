import { IsOptional, IsString } from 'class-validator';

export class UpdateCursoDto {
  @IsString()
  @IsOptional()
  nombre?: string;
}