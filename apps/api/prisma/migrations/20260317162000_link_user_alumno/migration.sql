-- AlterTable
ALTER TABLE `Alumno`
  ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Alumno_userId_key` ON `Alumno`(`userId`);

-- AddForeignKey
ALTER TABLE `Alumno`
  ADD CONSTRAINT `Alumno_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;
