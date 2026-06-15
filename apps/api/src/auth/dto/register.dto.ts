import { Role } from '@prisma/client';
import { IsDateString, IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  // Campos de alumno
  @ValidateIf((o: RegisterDto) => (o.role ?? Role.ALUMNO) === Role.ALUMNO)
  @IsString()
  @MinLength(2)
  nombre?: string;

  @ValidateIf((o: RegisterDto) => (o.role ?? Role.ALUMNO) === Role.ALUMNO)
  @IsInt()
  @Min(1)
  cursoId?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  apellido?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
