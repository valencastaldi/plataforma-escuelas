-- Ensure existing rows satisfy the new required user link.
DELETE FROM `Alumno` WHERE `userId` IS NULL;

-- Enforce required relation Alumno -> User.
ALTER TABLE `Alumno` DROP FOREIGN KEY `Alumno_userId_fkey`;
ALTER TABLE `Alumno` MODIFY `userId` INTEGER NOT NULL;
ALTER TABLE `Alumno`
  ADD CONSTRAINT `Alumno_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create avisos table.
CREATE TABLE `Aviso` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(191) NOT NULL,
  `contenido` TEXT NOT NULL,
  `categoria` ENUM('INSTITUCIONAL', 'ADMINISTRATIVO', 'ACADEMICO') NOT NULL DEFAULT 'INSTITUCIONAL',
  `publicadoDesde` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  INDEX `Aviso_activo_publicadoDesde_idx`(`activo`, `publicadoDesde`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
