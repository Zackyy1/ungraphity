-- DropForeignKey
ALTER TABLE "Record" DROP CONSTRAINT "Record_trackableId_fkey";

-- DropForeignKey
ALTER TABLE "Trackable" DROP CONSTRAINT "Trackable_scenarioId_fkey";

-- AddForeignKey
ALTER TABLE "Trackable" ADD CONSTRAINT "Trackable_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_trackableId_fkey" FOREIGN KEY ("trackableId") REFERENCES "Trackable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
