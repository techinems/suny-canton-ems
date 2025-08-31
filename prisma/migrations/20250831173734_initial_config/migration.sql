-- CreateEnum
CREATE TYPE "public"."ShirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- CreateEnum
CREATE TYPE "public"."Position" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'CAPTAIN', 'LIEUTENANT', 'MEMBER', 'PROBATIONARY_MEMBER', 'ALUMNI');

-- CreateEnum
CREATE TYPE "public"."MembershipStanding" AS ENUM ('GOOD', 'PROBATION', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."MedicalLevel" AS ENUM ('EMR', 'EMT', 'AEMT');

-- CreateEnum
CREATE TYPE "public"."HousingType" AS ENUM ('ON_CAMPUS', 'OFF_CAMPUS', 'COMMUTER');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVisibility" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT,
    "last_name" TEXT,
    "preferred_name" TEXT,
    "avatar" TEXT,
    "shirt_size" "public"."ShirtSize",
    "dob" DATE NOT NULL,
    "canton_email" TEXT,
    "position" "public"."Position" NOT NULL,
    "major" TEXT,
    "membership_standing" "public"."MembershipStanding" NOT NULL,
    "canton_card_id" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "phone_number" TEXT,
    "medical_level" "public"."MedicalLevel",
    "housing_type" "public"."HousingType" NOT NULL,
    "building" TEXT,
    "room_number" INTEGER NOT NULL,
    "home_address" TEXT,
    "local_address" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."call_log" (
    "id" TEXT NOT NULL,
    "call_date" DATE,
    "en_route_date" DATE,
    "on_scene_date" DATE,
    "clear_date" DATE,
    "location" TEXT,
    "nature" TEXT,
    "transport_required" BOOLEAN NOT NULL DEFAULT false,
    "crew_chief_id" TEXT,
    "member_ids" TEXT[],
    "notes" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."certifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document" TEXT,
    "issue_date" DATE,
    "expiration_date" DATE,
    "issuing_agency" TEXT,
    "cert_number" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compliance_checks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "check_date" DATE NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "quantity" INTEGER NOT NULL,
    "location" TEXT,
    "purchase_date" DATE,
    "expiration_date" DATE,
    "cost" DOUBLE PRECISION,
    "supplier" TEXT,
    "critical" BOOLEAN NOT NULL DEFAULT false,
    "last_checked" DATE,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CallMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CallMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "_CallMembers_B_index" ON "public"."_CallMembers"("B");

-- AddForeignKey
ALTER TABLE "public"."call_log" ADD CONSTRAINT "call_log_crew_chief_id_fkey" FOREIGN KEY ("crew_chief_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."certifications" ADD CONSTRAINT "certifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compliance_checks" ADD CONSTRAINT "compliance_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CallMembers" ADD CONSTRAINT "_CallMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."call_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CallMembers" ADD CONSTRAINT "_CallMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
