/*
  Warnings:

  - Made the column `fatherName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `motherName` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `permanentAddress` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneNumber` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `fatherName` VARCHAR(191) NOT NULL,
    MODIFY `motherName` VARCHAR(191) NOT NULL,
    MODIFY `permanentAddress` VARCHAR(191) NOT NULL,
    MODIFY `phoneNumber` VARCHAR(191) NOT NULL;
