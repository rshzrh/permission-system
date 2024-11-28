/*
  Warnings:

  - You are about to drop the column `childId` on the `t_group_group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fk_parent,fk_child]` on the table `t_group_group` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fk_child` to the `t_group_group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "t_group_group" DROP CONSTRAINT "t_group_group_childId_fkey";

-- DropIndex
DROP INDEX "t_group_group_fk_parent_childId_key";

-- AlterTable
ALTER TABLE "t_group_group" DROP COLUMN "childId",
ADD COLUMN     "fk_child" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "t_group_group_fk_parent_fk_child_key" ON "t_group_group"("fk_parent", "fk_child");

-- AddForeignKey
ALTER TABLE "t_group_group" ADD CONSTRAINT "t_group_group_fk_child_fkey" FOREIGN KEY ("fk_child") REFERENCES "t_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
