-- CreateTable
CREATE TABLE "public"."DeletionLog" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "fileId" TEXT,

    CONSTRAINT "DeletionLog_pkey" PRIMARY KEY ("id")
);
