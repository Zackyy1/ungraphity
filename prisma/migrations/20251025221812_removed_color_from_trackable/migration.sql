-- AlterTable
ALTER TABLE "Trackable" DROP COLUMN IF EXISTS "color",
ADD COLUMN IF NOT EXISTS "chartType" TEXT DEFAULT 'area';

