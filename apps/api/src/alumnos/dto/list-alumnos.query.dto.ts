import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ListAlumnosQueryDto {
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
  cursoId?: number;

  @IsString()
  @IsOptional()
  q?: string;
}