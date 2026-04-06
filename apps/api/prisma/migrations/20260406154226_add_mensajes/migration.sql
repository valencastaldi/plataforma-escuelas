-- AlterTable
ALTER TABLE `aviso` MODIFY `contenido` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Mensaje` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contenido` TEXT NOT NULL,
    `autorId` INTEGER NOT NULL,
    `cursoId` INTEGER NULL,
    `destinatarioId` INTEGER NULL,
    `padreId` INTEGER NULL,
    `soloProfesor` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Mensaje_autorId_idx`(`autorId`),
    INDEX `Mensaje_cursoId_idx`(`cursoId`),
    INDEX `Mensaje_destinatarioId_idx`(`destinatarioId`),
    INDEX `Mensaje_padreId_idx`(`padreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `Curso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_destinatarioId_fkey` FOREIGN KEY (`destinatarioId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mensaje` ADD CONSTRAINT `Mensaje_padreId_fkey` FOREIGN KEY (`padreId`) REFERENCES `Mensaje`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
