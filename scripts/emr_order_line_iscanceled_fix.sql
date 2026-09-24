-- ---------------------------------------------------------------------------------------------
-- Order lines saved from "Manage Patient Orders" were stored with IsCanceled = 1 (the column's
-- default) even though they were active, so EMR screens that hide cancelled lines did not show them.
-- The form now sends IsCanceled = 0. This script:
--   1. shows how many active lines are wrongly flagged,
--   2. clears the flag on lines whose status is not Cancelled (OrderStatusId 2),
--   3. makes 0 the column default so new rows from any screen start as "not cancelled".
-- Safe to run more than once. Works with MySQL Workbench safe-update mode (key column in WHERE).
-- Database: test
-- ---------------------------------------------------------------------------------------------

-- 1) preview
SELECT COUNT(*) AS wrongly_flagged_lines
FROM patientorderdetails
WHERE PatientOrderDetailId > 0 AND IsCanceled = 1 AND (OrderStatusId IS NULL OR OrderStatusId <> 2);

-- 2) repair
UPDATE patientorderdetails
SET IsCanceled = 0
WHERE PatientOrderDetailId > 0 AND IsCanceled = 1 AND (OrderStatusId IS NULL OR OrderStatusId <> 2);

-- 3) default for new rows
ALTER TABLE patientorderdetails ALTER COLUMN IsCanceled SET DEFAULT 0;
