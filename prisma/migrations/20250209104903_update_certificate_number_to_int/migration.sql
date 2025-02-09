/*
  Warnings:

  - You are about to alter the column `certificateNo` on the `Certificate` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- First, add a temporary column
ALTER TABLE `Certificate` ADD COLUMN `temp_certificateNo` INT;

-- Update the temporary column with sequential numbers
SET @row_number = 0;
UPDATE `Certificate` SET `temp_certificateNo` = (@row_number:=@row_number + 1);

-- Drop the old column and constraints
ALTER TABLE `Certificate` DROP COLUMN `certificateNo`;

-- Add the new column with auto-increment
ALTER TABLE `Certificate` ADD COLUMN `certificateNo` INT NOT NULL AUTO_INCREMENT,
ADD UNIQUE INDEX `Certificate_certificateNo_key` (`certificateNo`);

-- Copy data from temporary column
UPDATE `Certificate` SET `certificateNo` = `temp_certificateNo`;

-- Drop the temporary column
ALTER TABLE `Certificate` DROP COLUMN `temp_certificateNo`;
