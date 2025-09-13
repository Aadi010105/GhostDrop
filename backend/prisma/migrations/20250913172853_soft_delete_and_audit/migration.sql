/*
  Warnings:

  - You are about to drop the `DeletionLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."DeletionStatus" AS ENUM ('SUCCESS_SOFT_DELETE', 'SUCCESS_HARD_DELETE', 'FAILED_S3', 'FAILED_DB');

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."DeletionLog";

-- CreateTable
CREATE TABLE "public"."DeletionActivity" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "userId" TEXT,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "status" "public"."DeletionStatus" NOT NULL,
    "error" TEXT,

    CONSTRAINT "DeletionActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DeletionActivity" ADD CONSTRAINT "DeletionActivity_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."File"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
