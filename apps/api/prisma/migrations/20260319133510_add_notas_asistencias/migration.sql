-- CreateTable
CREATE TABLE `Nota` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `valor` DOUBLE NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL DEFAULT 'GENERAL',
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alumnoId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Nota_alumnoId_idx`(`alumnoId`),
    INDEX `Nota_cursoId_idx`(`cursoId`),
    INDEX `Nota_fecha_idx`(`fecha`),
    INDEX `Nota_alumnoId_cursoId_idx`(`alumnoId`, `cursoId`),
    UNIQUE INDEX `Nota_alumnoId_cursoId_descripcion_fecha_key`(`alumnoId`, `cursoId`, `descripcion`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATE NOT NULL,
    `presente` BOOLEAN NOT NULL DEFAULT true,
    `observacion` VARCHAR(191) NULL,
    `alumnoId` INTEGER NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Asistencia_alumnoId_idx`(`alumnoId`),
    INDEX `Asistencia_cursoId_idx`(`cursoId`),
    INDEX `Asistencia_fecha_idx`(`fecha`),
    UNIQUE INDEX `Asistencia_alumnoId_cursoId_fecha_key`(`alumnoId`, `cursoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asistencia` ADD CONSTRAINT `Asistencia_alumnoId_fkey` FOREIGN KEY (`alumnoId`) REFERENCES `Alumno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asistencia` ADD CONSTRAINT `Asistencia_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
