/*
  Warnings:

  - You are about to drop the column `building` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."call_log" ADD COLUMN     "building_id" TEXT,
ALTER COLUMN "location" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "building",
ADD COLUMN     "building_id" TEXT;

-- CreateTable
CREATE TABLE "public"."buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buildings_name_key" ON "public"."buildings"("name");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."call_log" ADD CONSTRAINT "call_log_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
