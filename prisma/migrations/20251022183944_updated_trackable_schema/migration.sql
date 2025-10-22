/*
  Warnings:

  - You are about to drop the column `date` on the `Record` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TrackableType" AS ENUM ('COUNTER', 'QUANTITY', 'BOOLEAN', 'COMPOUND');

-- CreateEnum
CREATE TYPE "TrackablePeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'NONE');

-- CreateEnum
CREATE TYPE "TrackableVisibility" AS ENUM ('DASHBOARD', 'HIDDEN');

-- CreateEnum
CREATE TYPE "TrackablePersistence" AS ENUM ('PERSISTENT', 'HIDE_ON_FILL');

-- CreateEnum
CREATE TYPE "GoalKind" AS ENUM ('ABSOLUTE', 'PER_PERIOD', 'STREAK');

-- CreateEnum
CREATE TYPE "GoalDirection" AS ENUM ('AT_LEAST', 'AT_MOST');

-- AlterTable
ALTER TABLE "Record" DROP COLUMN "date",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "localDate" TEXT,
ADD COLUMN     "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "value" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Trackable" ADD COLUMN     "automation" TEXT,
ADD COLUMN     "currentStreak" INTEGER DEFAULT 0,
ADD COLUMN     "goal" JSONB,
ADD COLUMN     "lastCompletedAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER DEFAULT 0,
ADD COLUMN     "period" "TrackablePeriod" NOT NULL DEFAULT 'DAILY',
ADD COLUMN     "persistence" "TrackablePersistence" NOT NULL DEFAULT 'PERSISTENT',
ADD COLUMN     "quickAdds" JSONB,
ADD COLUMN     "reminder" JSONB,
ADD COLUMN     "step" DOUBLE PRECISION,
ADD COLUMN     "template" JSONB,
ADD COLUMN     "type" "TrackableType" NOT NULL DEFAULT 'COUNTER',
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "visibility" "TrackableVisibility" NOT NULL DEFAULT 'DASHBOARD';

-- CreateIndex
CREATE INDEX "Record_trackableId_localDate_idx" ON "Record"("trackableId", "localDate");

-- CreateIndex
CREATE INDEX "Record_trackableId_recordedAt_idx" ON "Record"("trackableId", "recordedAt");
