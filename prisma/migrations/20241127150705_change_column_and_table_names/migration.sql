/*
  Warnings:

  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tweet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TweetPermissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupGroup" DROP CONSTRAINT "GroupGroup_childId_fkey";

-- DropForeignKey
ALTER TABLE "GroupGroup" DROP CONSTRAINT "GroupGroup_parentId_fkey";

-- DropForeignKey
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupUser" DROP CONSTRAINT "GroupUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Tweet" DROP CONSTRAINT "Tweet_parentTweetId_fkey";

-- DropForeignKey
ALTER TABLE "TweetPermissions" DROP CONSTRAINT "TweetPermissions_tweetId_fkey";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupGroup";

-- DropTable
DROP TABLE "GroupUser";

-- DropTable
DROP TABLE "Tweet";

-- DropTable
DROP TABLE "TweetPermissions";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "t_user" (
    "id" TEXT NOT NULL,
    "c_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_group" (
    "id" TEXT NOT NULL,

    CONSTRAINT "t_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_group_user" (
    "id" TEXT NOT NULL,
    "fk_user" TEXT NOT NULL,
    "fk_group" TEXT NOT NULL,

    CONSTRAINT "t_group_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_group_group" (
    "id" TEXT NOT NULL,
    "fk_parent" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "t_group_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_tweet" (
    "id" TEXT NOT NULL,
    "c_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "c_content" TEXT NOT NULL,
    "fk_author" TEXT NOT NULL,
    "c_hashtags" TEXT[],
    "c_category" "TweetCategory",
    "c_location" TEXT,
    "fk_parent" TEXT,

    CONSTRAINT "t_tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_tweet_perms" (
    "id" TEXT NOT NULL,
    "fk_tweet" TEXT NOT NULL,
    "c_inherit_view_perms" BOOLEAN NOT NULL DEFAULT true,
    "c_inherit_edit_perms" BOOLEAN NOT NULL DEFAULT true,
    "c_view_perms" TEXT[],
    "c_edit_perms" TEXT[],

    CONSTRAINT "t_tweet_perms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_group_user_fk_user_fk_group_key" ON "t_group_user"("fk_user", "fk_group");

-- CreateIndex
CREATE UNIQUE INDEX "t_group_group_fk_parent_childId_key" ON "t_group_group"("fk_parent", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "t_tweet_perms_fk_tweet_key" ON "t_tweet_perms"("fk_tweet");

-- AddForeignKey
ALTER TABLE "t_group_user" ADD CONSTRAINT "t_group_user_fk_user_fkey" FOREIGN KEY ("fk_user") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_group_user" ADD CONSTRAINT "t_group_user_fk_group_fkey" FOREIGN KEY ("fk_group") REFERENCES "t_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_group_group" ADD CONSTRAINT "t_group_group_fk_parent_fkey" FOREIGN KEY ("fk_parent") REFERENCES "t_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_group_group" ADD CONSTRAINT "t_group_group_childId_fkey" FOREIGN KEY ("childId") REFERENCES "t_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_tweet" ADD CONSTRAINT "t_tweet_fk_author_fkey" FOREIGN KEY ("fk_author") REFERENCES "t_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_tweet" ADD CONSTRAINT "t_tweet_fk_parent_fkey" FOREIGN KEY ("fk_parent") REFERENCES "t_tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_tweet_perms" ADD CONSTRAINT "t_tweet_perms_fk_tweet_fkey" FOREIGN KEY ("fk_tweet") REFERENCES "t_tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
