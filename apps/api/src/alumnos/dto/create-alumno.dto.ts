import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsInt()
  @Min(1)
  cursoId!: number;
}