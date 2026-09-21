ALTER TABLE "Session" ADD COLUMN "clientId" TEXT;
ALTER TABLE "TeacherSession" ADD COLUMN "clientId" TEXT;

CREATE INDEX "Session_clientId_idx" ON "Session"("clientId");
CREATE INDEX "TeacherSession_clientId_idx" ON "TeacherSession"("clientId");
