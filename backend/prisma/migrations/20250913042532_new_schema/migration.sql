-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP DEFAULT,
ALTER COLUMN "role" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Folder"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
