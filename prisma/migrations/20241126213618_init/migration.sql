-- CreateEnum
CREATE TYPE "TweetCategory" AS ENUM ('Sport', 'Finance', 'Tech', 'News');
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "GroupUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "GroupGroup" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    CONSTRAINT "GroupGroup_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "hashtags" TEXT [],
    "category" "TweetCategory",
    "location" TEXT,
    "parentTweetId" TEXT,
    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "TweetPermissions" (
    "id" TEXT NOT NULL,
    "tweetId" TEXT NOT NULL,
    "inheritViewPermissions" BOOLEAN NOT NULL DEFAULT true,
    "inheritEditPermissions" BOOLEAN NOT NULL DEFAULT true,
    "viewPermissions" TEXT [],
    "editPermissions" TEXT [],
    CONSTRAINT "TweetPermissions_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "GroupUser_userId_groupId_key" ON "GroupUser"("userId", "groupId");
-- CreateIndex
CREATE UNIQUE INDEX "GroupGroup_parentId_childId_key" ON "GroupGroup"("parentId", "childId");
-- CreateIndex
CREATE UNIQUE INDEX "TweetPermissions_tweetId_key" ON "TweetPermissions"("tweetId");
-- AddForeignKey
ALTER TABLE "GroupUser"
ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "GroupUser"
ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "GroupGroup"
ADD CONSTRAINT "GroupGroup_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "GroupGroup"
ADD CONSTRAINT "GroupGroup_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Tweet"
ADD CONSTRAINT "Tweet_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "Tweet"
ADD CONSTRAINT "Tweet_parentTweetId_fkey" FOREIGN KEY ("parentTweetId") REFERENCES "Tweet"("id") ON DELETE
SET NULL ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "TweetPermissions"
ADD CONSTRAINT "TweetPermissions_tweetId_fkey" FOREIGN KEY ("tweetId") REFERENCES "Tweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;