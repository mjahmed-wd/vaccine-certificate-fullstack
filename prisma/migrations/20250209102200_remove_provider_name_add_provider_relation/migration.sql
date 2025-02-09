/*
  Warnings:

  - You are about to drop the column `providerName` on the `VaccinationRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `VaccinationRecord` DROP COLUMN `providerName`;

-- AddForeignKey
ALTER TABLE `VaccinationRecord` ADD CONSTRAINT `VaccinationRecord_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `VaccineProvider`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
