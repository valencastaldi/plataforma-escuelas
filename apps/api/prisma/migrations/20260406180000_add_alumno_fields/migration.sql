-- AlterTable
ALTER TABLE `Alumno` ADD COLUMN `apellido` VARCHAR(191) NULL,
                     ADD COLUMN `dni` VARCHAR(191) NULL,
                     ADD COLUMN `fechaNacimiento` DATE NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Alumno_dni_key` ON `Alumno`(`dni`);
