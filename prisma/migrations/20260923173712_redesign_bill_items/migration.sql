/*
  Warnings:

  - You are about to drop the column `userId` on the `BillItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_userId_fkey";

-- AlterTable
ALTER TABLE "BillItem" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "BillItemSelection" (
    "id" TEXT NOT NULL,
    "billItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillItemSelection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillItemSelection_billItemId_userId_key" ON "BillItemSelection"("billItemId", "userId");

-- AddForeignKey
ALTER TABLE "BillItemSelection" ADD CONSTRAINT "BillItemSelection_billItemId_fkey" FOREIGN KEY ("billItemId") REFERENCES "BillItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItemSelection" ADD CONSTRAINT "BillItemSelection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
