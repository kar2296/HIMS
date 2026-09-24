-- ============================================================================
-- Clinical note signing & amendment (hims_patientclinicalnotes)
-- Used by: PatientClinicalNotes model / PatientClinicalNotesBo
--   NoteStatus: 1 = Draft, 2 = Signed (locked), 3 = Amended (superseded by AmendmentOf row)
-- Safe to run more than once: each column is added only if it is missing.
-- Existing notes become Draft (1), which is how the code already treats them.
-- ============================================================================

SET @tbl := 'hims_patientclinicalnotes';

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN SignedAt DATETIME NULL',
    'SELECT ''SignedAt already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'SignedAt');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN SignedBy INT NULL',
    'SELECT ''SignedBy already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'SignedBy');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN SignedContent LONGTEXT NULL',
    'SELECT ''SignedContent already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'SignedContent');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN NoteStatus INT NULL DEFAULT 1',
    'SELECT ''NoteStatus already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'NoteStatus');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN AmendmentOf BIGINT NULL',
    'SELECT ''AmendmentOf already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'AmendmentOf');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD COLUMN AmendmentReason VARCHAR(500) NULL',
    'SELECT ''AmendmentReason already exists''')
    FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND COLUMN_NAME = 'AmendmentReason');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Existing rows: mark as Draft so they behave exactly as before.
-- The primary-key condition keeps MySQL Workbench "safe update mode" (error 1175) happy.
UPDATE hims_patientclinicalnotes SET NoteStatus = 1 WHERE PatientClinicalNoteId > 0 AND NoteStatus IS NULL;

-- Lookup of amendments by the original note.
SET @sql := (SELECT IF(COUNT(*) = 0,
    'ALTER TABLE hims_patientclinicalnotes ADD INDEX idx_pcn_amendmentof (AmendmentOf)',
    'SELECT ''idx_pcn_amendmentof already exists''')
    FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tbl AND INDEX_NAME = 'idx_pcn_amendmentof');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
