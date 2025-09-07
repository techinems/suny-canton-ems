/*
  Warnings:

  - The values [ON_CAMPUS,OFF_CAMPUS,COMMUTER] on the enum `HousingType` will be removed. If these variants are still used in the database, this will fail.
  - The values [EMR,AEMT] on the enum `MedicalLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [GOOD,PROBATION,INACTIVE] on the enum `MembershipStanding` will be removed. If these variants are still used in the database, this will fail.
  - The values [PRESIDENT,VICE_PRESIDENT,SECRETARY,TREASURER,CAPTAIN,LIEUTENANT,MEMBER,PROBATIONARY_MEMBER,ALUMNI] on the enum `Position` will be removed. If these variants are still used in the database, this will fail.
  - The values [XS,S,M,L,XL,XXL,XXXL] on the enum `ShirtSize` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `call_date` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `clear_date` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `crew_chief_id` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `en_route_date` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `member_ids` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `nature` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `on_scene_date` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `transport_required` on the `call_log` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `expiration_date` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `issue_date` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `issuing_agency` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `certifications` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `compliance_checks` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `critical` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `last_checked` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the `_CallMembers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `back_in_service` to the `call_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `call_enroute` to the `call_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `call_received` to the `call_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_of_care` to the `call_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `on_scene` to the `call_log` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `call_log` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `cert_name` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cert_scan` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_id` to the `certifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `check_type` to the `compliance_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `member_checked` to the `compliance_checks` table without a default value. This is not possible if the table is not empty.
  - Made the column `dob` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `canton_card_id` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gpa` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `housing_type` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `room_number` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."LevelOfCare" AS ENUM ('EMT', 'None');

-- CreateEnum
CREATE TYPE "public"."CallType" AS ENUM ('Standby');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('Cancelled enroute', 'Complete');

-- CreateEnum
CREATE TYPE "public"."ComplianceType" AS ENUM ('Sex Offender', 'Conduct', 'GPA');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."HousingType_new" AS ENUM ('On Campus', 'Off Campus');
ALTER TABLE "public"."users" ALTER COLUMN "housing_type" TYPE "public"."HousingType_new" USING ("housing_type"::text::"public"."HousingType_new");
ALTER TYPE "public"."HousingType" RENAME TO "HousingType_old";
ALTER TYPE "public"."HousingType_new" RENAME TO "HousingType";
DROP TYPE "public"."HousingType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MedicalLevel_new" AS ENUM ('EMT', 'First Responder');
ALTER TABLE "public"."users" ALTER COLUMN "medical_level" TYPE "public"."MedicalLevel_new" USING ("medical_level"::text::"public"."MedicalLevel_new");
ALTER TYPE "public"."MedicalLevel" RENAME TO "MedicalLevel_old";
ALTER TYPE "public"."MedicalLevel_new" RENAME TO "MedicalLevel";
DROP TYPE "public"."MedicalLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MembershipStanding_new" AS ENUM ('Good', 'Bad');
ALTER TABLE "public"."users" ALTER COLUMN "membership_standing" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "membership_standing" TYPE "public"."MembershipStanding_new" USING ("membership_standing"::text::"public"."MembershipStanding_new");
ALTER TYPE "public"."MembershipStanding" RENAME TO "MembershipStanding_old";
ALTER TYPE "public"."MembershipStanding_new" RENAME TO "MembershipStanding";
DROP TYPE "public"."MembershipStanding_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Position_new" AS ENUM ('Advisor', 'President', 'Vice President', 'Secretary', 'Treasurer', 'Senator', 'Member', 'Honor Roll', 'Auxillary');
ALTER TABLE "public"."users" ALTER COLUMN "position" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "position" TYPE "public"."Position_new" USING ("position"::text::"public"."Position_new");
ALTER TYPE "public"."Position" RENAME TO "Position_old";
ALTER TYPE "public"."Position_new" RENAME TO "Position";
DROP TYPE "public"."Position_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ShirtSize_new" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl');
ALTER TABLE "public"."users" ALTER COLUMN "shirt_size" TYPE "public"."ShirtSize_new" USING ("shirt_size"::text::"public"."ShirtSize_new");
ALTER TYPE "public"."ShirtSize" RENAME TO "ShirtSize_old";
ALTER TYPE "public"."ShirtSize_new" RENAME TO "ShirtSize";
DROP TYPE "public"."ShirtSize_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."_CallMembers" DROP CONSTRAINT "_CallMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CallMembers" DROP CONSTRAINT "_CallMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."call_log" DROP CONSTRAINT "call_log_crew_chief_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."certifications" DROP CONSTRAINT "certifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."compliance_checks" DROP CONSTRAINT "compliance_checks_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."call_log" DROP COLUMN "call_date",
DROP COLUMN "clear_date",
DROP COLUMN "crew_chief_id",
DROP COLUMN "en_route_date",
DROP COLUMN "member_ids",
DROP COLUMN "nature",
DROP COLUMN "notes",
DROP COLUMN "on_scene_date",
DROP COLUMN "transport_required",
ADD COLUMN     "back_in_service" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "call_enroute" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "call_received" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "crew" TEXT[],
ADD COLUMN     "dispatch_info" TEXT,
ADD COLUMN     "items_used" TEXT[],
ADD COLUMN     "jumpbag_used" BOOLEAN,
ADD COLUMN     "level_of_care" "public"."LevelOfCare" NOT NULL,
ADD COLUMN     "on_scene" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "public"."CallStatus",
ADD COLUMN     "type" "public"."CallType",
ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."certifications" DROP COLUMN "document",
DROP COLUMN "expiration_date",
DROP COLUMN "issue_date",
DROP COLUMN "issuing_agency",
DROP COLUMN "name",
DROP COLUMN "user_id",
ADD COLUMN     "cert_expiration" DATE,
ADD COLUMN     "cert_issue_date" DATE,
ADD COLUMN     "cert_name" TEXT NOT NULL,
ADD COLUMN     "cert_scan" TEXT NOT NULL,
ADD COLUMN     "issuing_authority" TEXT,
ADD COLUMN     "member_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."compliance_checks" DROP COLUMN "user_id",
ADD COLUMN     "check_type" "public"."ComplianceType" NOT NULL,
ADD COLUMN     "member_checked" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."inventory" DROP COLUMN "category",
DROP COLUMN "cost",
DROP COLUMN "critical",
DROP COLUMN "last_checked",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "supplier",
ADD COLUMN     "disposable" BOOLEAN,
ADD COLUMN     "item_name" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "manufacturing_date" DATE,
ADD COLUMN     "paid_by" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "size" TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "avatar" TEXT,
ALTER COLUMN "dob" SET NOT NULL,
ALTER COLUMN "position" DROP DEFAULT,
ALTER COLUMN "membership_standing" DROP DEFAULT,
ALTER COLUMN "canton_card_id" SET NOT NULL,
ALTER COLUMN "gpa" SET NOT NULL,
ALTER COLUMN "housing_type" SET NOT NULL,
ALTER COLUMN "room_number" SET NOT NULL;

-- DropTable
DROP TABLE "public"."_CallMembers";

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compliance_checks" ADD CONSTRAINT "compliance_checks_member_checked_fkey" FOREIGN KEY ("member_checked") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
