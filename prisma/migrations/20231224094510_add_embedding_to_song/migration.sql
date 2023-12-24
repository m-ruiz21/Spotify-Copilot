/*
  Warnings:

  - You are about to drop the column `encoding` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "encoding",
ADD COLUMN     "embedding" vector(1536);
