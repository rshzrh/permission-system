/*
  Warnings:

  - You are about to drop the column `editUserIds` on the `t_tweet` table. All the data in the column will be lost.
  - You are about to drop the column `viewUserIds` on the `t_tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "t_tweet" DROP COLUMN "editUserIds",
DROP COLUMN "viewUserIds",
ADD COLUMN     "c_editors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "c_viewers" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "idx_author" ON "t_tweet"("fk_author");

-- CreateIndex
CREATE INDEX "idx_parent" ON "t_tweet"("fk_parent");

-- CreateIndex
CREATE INDEX "idx_viewers" ON "t_tweet"("c_created_at", "c_viewers");
