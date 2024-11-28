-- AlterTable
ALTER TABLE "t_tweet" ADD COLUMN     "c_inherit_edit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "c_inherit_view" BOOLEAN NOT NULL DEFAULT false;
