/*
  Warnings:

  - Added the required column `providerId` to the `VaccinationRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerName` to the `VaccinationRecord` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the columns as nullable
ALTER TABLE `VaccinationRecord` ADD COLUMN `providerId` VARCHAR(191);
ALTER TABLE `VaccinationRecord` ADD COLUMN `providerName` VARCHAR(191);

-- Update existing records with default values
UPDATE `VaccinationRecord` SET 
  `providerId` = (
    SELECT `id` 
    FROM `VaccineProvider` 
    WHERE `vaccineId` = `VaccinationRecord`.`vaccineId` 
    LIMIT 1
  ),
  `providerName` = (
    SELECT `name` 
    FROM `VaccineProvider` 
    WHERE `vaccineId` = `VaccinationRecord`.`vaccineId` 
    LIMIT 1
  );

-- Make the columns required
ALTER TABLE `VaccinationRecord` MODIFY `providerId` VARCHAR(191) NOT NULL;
ALTER TABLE `VaccinationRecord` MODIFY `providerName` VARCHAR(191) NOT NULL;

-- Add the index
CREATE INDEX `VaccinationRecord_providerId_idx` ON `VaccinationRecord`(`providerId`);
