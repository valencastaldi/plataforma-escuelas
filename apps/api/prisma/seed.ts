import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpieza (orden importa por FK)
  await prisma.nota.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.curso.deleteMany();
  await prisma.user.deleteMany();

  const docentePassword = 'Docente123!';
  const docenteHash = await bcrypt.hash(docentePassword, 10);

  await prisma.user.create({
    data: {
      email: 'docente@escuelas.local',
      username: 'docente',
      passwordHash: docenteHash,
      role: Role.DOCENTE,
    },
  });

  // Cursos
  const cursos = await prisma.curso.createMany({
    data: [
      { nombre: 'Matemáticas' },
      { nombre: 'Lengua' },
      { nombre: 'Historia' },
    ],
  });

  // Buscar IDs reales (createMany no devuelve registros en MySQL por defecto)
  const [mat, len, his] = await prisma.curso.findMany({ orderBy: { id: 'asc' } });

  // Alumnos
  await prisma.alumno.createMany({
    data: [
      { nombre: 'Juan Pérez', cursoId: mat.id },
      { nombre: 'Ana Gómez', cursoId: mat.id },
      { nombre: 'Luis Díaz', cursoId: len.id },
      { nombre: 'María López', cursoId: his.id },
    ],
  });

  const alumnos = await prisma.alumno.findMany({ orderBy: { id: 'asc' } });

  if (alumnos.length < 2) {
    throw new Error('No se pudieron crear alumnos base para vincular usuarios de prueba');
  }

  const alumnoPassword = 'Alumno123!';
  const alumnoHash = await bcrypt.hash(alumnoPassword, 10);

  const juanUser = await prisma.user.create({
    data: {
      email: 'juan@escuelas.local',
      username: 'juan',
      passwordHash: alumnoHash,
      role: Role.ALUMNO,
    },
  });

  const anaUser = await prisma.user.create({
    data: {
      email: 'ana@escuelas.local',
      username: 'ana',
      passwordHash: alumnoHash,
      role: Role.ALUMNO,
    },
  });

  await prisma.alumno.update({
    where: { id: alumnos[0]!.id },
    data: { userId: juanUser.id },
  });

  await prisma.alumno.update({
    where: { id: alumnos[1]!.id },
    data: { userId: anaUser.id },
  });

  console.log('Seed OK');
  console.log(`Cursos creados: ${cursos.count}`);
  console.log('Docente inicial: docente@escuelas.local / Docente123!');
  console.log('Alumno inicial: juan@escuelas.local / Alumno123!');
  console.log('Alumno inicial: ana@escuelas.local / Alumno123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });