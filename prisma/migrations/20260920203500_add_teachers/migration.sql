-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeacherSession_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TestAttempt"
ADD COLUMN "teacherId" TEXT,
ADD COLUMN "studentName" TEXT,
ADD COLUMN "studentEmail" TEXT,
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'ES';

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "Teacher_name_idx" ON "Teacher"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSession_token_key" ON "TeacherSession"("token");

-- CreateIndex
CREATE INDEX "TeacherSession_token_idx" ON "TeacherSession"("token");

-- CreateIndex
CREATE INDEX "TeacherSession_teacherId_idx" ON "TeacherSession"("teacherId");

-- CreateIndex
CREATE INDEX "TestAttempt_teacherId_completedAt_idx" ON "TestAttempt"("teacherId", "completedAt");

-- AddForeignKey
ALTER TABLE "TeacherSession" ADD CONSTRAINT "TeacherSession_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
