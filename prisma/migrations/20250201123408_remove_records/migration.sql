/*
  Warnings:

  - Added the required column `vaccinatedByName` to the `VaccinationRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vaccineName` to the `VaccinationRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `VaccinationRecord` DROP FOREIGN KEY `VaccinationRecord_vaccinatedById_fkey`;

-- AlterTable
ALTER TABLE `VaccinationRecord` ADD COLUMN `vaccinatedByName` VARCHAR(191) NOT NULL,
    ADD COLUMN `vaccineName` VARCHAR(191) NOT NULL;
