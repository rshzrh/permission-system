-- DropForeignKey
ALTER TABLE "t_tweet_perms" DROP CONSTRAINT "t_tweet_perms_fk_tweet_fkey";

-- AlterTable
ALTER TABLE "t_tweet" ADD COLUMN     "editUserIds" TEXT[],
ADD COLUMN     "viewUserIds" TEXT[];
