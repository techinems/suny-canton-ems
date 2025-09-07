/*
  Warnings:

  - The values [First Responder] on the enum `MedicalLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [Auxillary] on the enum `Position` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."HousingType" ADD VALUE 'Commuter';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MedicalLevel_new" AS ENUM ('EMR', 'EMT', 'AEMT');
ALTER TABLE "public"."users" ALTER COLUMN "medical_level" TYPE "public"."MedicalLevel_new" USING ("medical_level"::text::"public"."MedicalLevel_new");
ALTER TYPE "public"."MedicalLevel" RENAME TO "MedicalLevel_old";
ALTER TYPE "public"."MedicalLevel_new" RENAME TO "MedicalLevel";
DROP TYPE "public"."MedicalLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Position_new" AS ENUM ('Member', 'Probationary Member', 'Lieutenant', 'Captain', 'Treasurer', 'Secretary', 'Vice President', 'President', 'Alumni', 'Advisor', 'Senator', 'Honor Roll', 'Auxiliary');
ALTER TABLE "public"."users" ALTER COLUMN "position" TYPE "public"."Position_new" USING ("position"::text::"public"."Position_new");
ALTER TYPE "public"."Position" RENAME TO "Position_old";
ALTER TYPE "public"."Position_new" RENAME TO "Position";
DROP TYPE "public"."Position_old";
COMMIT;
