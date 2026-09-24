-- ============================================================================
-- Prescription allergy override (who overrode an allergy warning, when, why)
-- Used by: PrescriptionDetail model (IsAllergyOverride, AllergyOverrideReason,
--          AllergyOverrideBy, AllergyOverrideAt).
-- Safe to run more than once: each column is added only if it is missing.
-- ============================================================================

SET @tbl := 'hims_prescriptiondetails';

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_prescriptiondetails ADD COLUMN IsAllergyOverride TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT ''IsAllergyOverride already exists''')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'IsAllergyOverride');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_prescriptiondetails ADD COLUMN AllergyOverrideReason VARCHAR(500) NULL',
    'SELECT ''AllergyOverrideReason already exists''')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'AllergyOverrideReason');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_prescriptiondetails ADD COLUMN AllergyOverrideBy INT NULL',
    'SELECT ''AllergyOverrideBy already exists''')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'AllergyOverrideBy');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_prescriptiondetails ADD COLUMN AllergyOverrideAt DATETIME NULL',
    'SELECT ''AllergyOverrideAt already exists''')
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'AllergyOverrideAt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
