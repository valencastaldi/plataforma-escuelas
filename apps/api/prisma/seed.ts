import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpieza (orden importa por FK)
  await prisma.nota.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.aviso.deleteMany();
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
      { nombre: 'A1/2' },
      { nombre: 'B1/2' },
      { nombre: 'C1/2' },
    ],
  });

  // Buscar IDs reales (createMany no devuelve registros en MySQL por defecto)
  const [mat, len, his] = await prisma.curso.findMany({ orderBy: { id: 'asc' } });

  const alumnoPassword = 'Alumno123!';
  const alumnoHash = await bcrypt.hash(alumnoPassword, 10);

  const alumnosSeed = [
    { nombre: 'Juan Pérez', cursoId: mat.id, email: 'juan@escuelas.local', username: 'juan' },
    { nombre: 'Ana Gómez', cursoId: mat.id, email: 'ana@escuelas.local', username: 'ana' },
    { nombre: 'Luis Díaz', cursoId: len.id, email: 'luis@escuelas.local', username: 'luis' },
    { nombre: 'María López', cursoId: his.id, email: 'maria@escuelas.local', username: 'maria' },
  ] as const;

  for (const item of alumnosSeed) {
    const alumnoUser = await prisma.user.create({
      data: {
        email: item.email,
        username: item.username,
        passwordHash: alumnoHash,
        role: Role.ALUMNO,
      },
    });

    await prisma.alumno.create({
      data: {
        nombre: item.nombre,
        cursoId: item.cursoId,
        userId: alumnoUser.id,
      },
    });
  }

  await prisma.aviso.createMany({
    data: [
      {
        titulo: 'Novedad semanal',
        contenido: 'Este viernes hay club de conversación de 18:00 a 19:30 para niveles intermedio y avanzado.',
        categoria: 'ACADEMICO',
      },
      {
        titulo: 'Aviso administrativo',
        contenido: 'Recordatorio: la cuota de abril vence el día 10. Puedes pagar en recepción o por transferencia.',
        categoria: 'ADMINISTRATIVO',
      },
      {
        titulo: 'Próximos exámenes',
        contenido: 'Mock exam interno: sábado 27. Inscripción abierta hasta el martes 23.',
        categoria: 'ACADEMICO',
      },
    ],
  });

  console.log('Seed OK');
  console.log(`Cursos creados: ${cursos.count}`);
  console.log('Docente inicial: docente@escuelas.local / Docente123!');
  console.log('Alumno inicial: juan@escuelas.local / Alumno123!');
  console.log('Alumno inicial: ana@escuelas.local / Alumno123!');
  console.log('Alumno inicial: luis@escuelas.local / Alumno123!');
  console.log('Alumno inicial: maria@escuelas.local / Alumno123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });