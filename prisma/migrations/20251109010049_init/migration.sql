-- CreateEnum
CREATE TYPE "ShirtSize" AS ENUM ('xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('Member', 'Probationary Member', 'Lieutenant', 'Captain', 'Treasurer', 'Secretary', 'Vice President', 'President', 'Alumni', 'Advisor', 'Senator', 'Honor Roll', 'Auxiliary');

-- CreateEnum
CREATE TYPE "MembershipStanding" AS ENUM ('Good', 'Bad');

-- CreateEnum
CREATE TYPE "MedicalLevel" AS ENUM ('EMR', 'EMT', 'AEMT');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('On Campus', 'Off Campus', 'Commuter');

-- CreateEnum
CREATE TYPE "LevelOfCare" AS ENUM ('EMT', 'None');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('Standby');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('Cancelled enroute', 'Complete');

-- CreateEnum
CREATE TYPE "ComplianceType" AS ENUM ('Sex Offender', 'Conduct', 'GPA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "preferred_name" TEXT,
    "avatar" TEXT,
    "shirt_size" "ShirtSize",
    "dob" DATE NOT NULL,
    "canton_email" TEXT,
    "position" "Position" NOT NULL,
    "major" TEXT,
    "membership_standing" "MembershipStanding" NOT NULL,
    "canton_card_id" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "phone_number" TEXT,
    "medical_level" "MedicalLevel",
    "housing_type" "HousingType" NOT NULL,
    "building_id" TEXT,
    "room_number" INTEGER,
    "home_address" TEXT,
    "local_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "name" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_log" (
    "id" TEXT NOT NULL,
    "call_received" TIMESTAMP(3) NOT NULL,
    "call_enroute" TIMESTAMP(3) NOT NULL,
    "on_scene" TIMESTAMP(3) NOT NULL,
    "back_in_service" TIMESTAMP(3) NOT NULL,
    "level_of_care" "LevelOfCare" NOT NULL,
    "dispatch_info" TEXT,
    "building_id" TEXT,
    "location" TEXT,
    "jumpbag_used" BOOLEAN,
    "type" "CallType",
    "items_used" TEXT[],
    "crew" TEXT[],
    "comments" TEXT,
    "status" "CallStatus",
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "cert_name" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "cert_scan" TEXT NOT NULL,
    "cert_issue_date" DATE,
    "cert_expiration" DATE,
    "cert_number" TEXT,
    "issuing_authority" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "check_type" "ComplianceType" NOT NULL,
    "member_checked" TEXT NOT NULL,
    "check_date" DATE NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "item_name" TEXT,
    "manufacturer" TEXT,
    "description" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "size" TEXT,
    "manufacturing_date" DATE,
    "purchase_date" DATE,
    "price" DOUBLE PRECISION,
    "paid_by" TEXT,
    "disposable" BOOLEAN,
    "expiration_date" DATE,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_name_key" ON "buildings"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_log" ADD CONSTRAINT "call_log_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_member_checked_fkey" FOREIGN KEY ("member_checked") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
