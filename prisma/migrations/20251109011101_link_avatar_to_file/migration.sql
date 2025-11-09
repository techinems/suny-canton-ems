/*
  Warnings:

  - A unique constraint covering the columns `[avatar]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_avatar_key" ON "users"("avatar");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_fkey" FOREIGN KEY ("avatar") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
