-- Adds an update watermark used by the incremental analytics pipeline.
ALTER TABLE "TestAttempt"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "TestAttempt_updatedAt_idx" ON "TestAttempt"("updatedAt");
