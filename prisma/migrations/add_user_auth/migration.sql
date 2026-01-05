-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AlterTable
ALTER TABLE "Gruppe" ADD COLUMN "erstellerId" TEXT;

-- AlterTable
ALTER TABLE "Mitglied" ADD COLUMN "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Gruppe" ADD CONSTRAINT "Gruppe_erstellerId_fkey" FOREIGN KEY ("erstellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mitglied" ADD CONSTRAINT "Mitglied_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
