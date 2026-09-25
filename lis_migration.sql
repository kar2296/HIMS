-- =============================================================
-- HIMS LIS Modes Enhancement Migration
-- Compatible: MySQL 5.7 / 8.0 / 9.x
-- NOTE: "ADD COLUMN IF NOT EXISTS" is MariaDB-only.
--       MySQL needs the INFORMATION_SCHEMA + PROCEDURE approach below.
-- =============================================================

-- *** Change this to your actual database name if different ***
USE `test`;

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper procedure: add column only when it does not already exist
-- ─────────────────────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS AddColIfMissing;

DELIMITER $$
CREATE PROCEDURE AddColIfMissing(
    IN p_tbl    VARCHAR(128),
    IN p_col    VARCHAR(128),
    IN p_def    TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   INFORMATION_SCHEMA.COLUMNS
        WHERE  TABLE_SCHEMA = DATABASE()
          AND  TABLE_NAME   = p_tbl
          AND  COLUMN_NAME  = p_col
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_tbl, '` ADD COLUMN `', p_col, '` ', p_def);
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END$$
DELIMITER ;

-- =============================================================
-- 1.  lisinterfaceresults  —  restore DisplayNo
-- =============================================================
CALL AddColIfMissing(
    'lisinterfaceresults', 'DisplayNo',
    'INT NULL DEFAULT NULL COMMENT "Sort order for analyte display within a sample"'
);

-- =============================================================
-- 2.  investigationsettings  —  per-facility support
-- =============================================================
CALL AddColIfMissing(
    'investigationsettings', 'FacilityId',
    'BIGINT NULL DEFAULT NULL COMMENT "NULL = global default; links to specific facility"'
);

-- =============================================================
-- 3.  investigationsettings  —  LIS interface mode columns
-- =============================================================
CALL AddColIfMissing('investigationsettings', 'LabLISInterfaceEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1 = analysers can push results via LIS interface"');
CALL AddColIfMissing('investigationsettings', 'LabLISMode',
    'TINYINT NOT NULL DEFAULT 0 COMMENT "0=Disabled 1=Unidirectional 2=Bidirectional"');
CALL AddColIfMissing('investigationsettings', 'LabAutoResultAccept',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1 = auto-map LIS result into workorder without review"');
CALL AddColIfMissing('investigationsettings', 'RadioRISInterfaceEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1 = PACS can push results via RIS interface"');
CALL AddColIfMissing('investigationsettings', 'RadioAutoResultAccept',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "1 = auto-map RIS result without review"');

-- =============================================================
-- 4.  investigationsettings  —  additional lab workflow flags
-- =============================================================
CALL AddColIfMissing('investigationsettings', 'LabSampleRejection',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Sample rejection step with rejection reason"');
CALL AddColIfMissing('investigationsettings', 'LabBarcodePrint',
    'TINYINT(1) NOT NULL DEFAULT 1 COMMENT "Print barcode label on sample acceptance"');
CALL AddColIfMissing('investigationsettings', 'LabResultRecheck',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Allow repeat/recheck test from approval screen"');
CALL AddColIfMissing('investigationsettings', 'LabResultRelease',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Explicit release step before patient can view report"');
CALL AddColIfMissing('investigationsettings', 'LabCriticalValueAlert',
    'TINYINT(1) NOT NULL DEFAULT 1 COMMENT "Send critical-value notification to nursing/doctor"');
CALL AddColIfMissing('investigationsettings', 'LabExternalLabEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Allow forwarding orders to external reference labs"');
CALL AddColIfMissing('investigationsettings', 'LabMicrobiologyEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Enable culture/sensitivity/organism sub-module"');
CALL AddColIfMissing('investigationsettings', 'MicrobiologyEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Microbiology department fully enabled"');
CALL AddColIfMissing('investigationsettings', 'LabOrderPriority',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Enable STAT/URGENT/ROUTINE priority on orders"');
CALL AddColIfMissing('investigationsettings', 'LabConsentRequired',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Require patient consent before certain tests"');

-- =============================================================
-- 5.  investigationsettings  —  TAT alert settings
-- =============================================================
CALL AddColIfMissing('investigationsettings', 'LabTATAlertEnabled',
    'TINYINT(1) NOT NULL DEFAULT 0 COMMENT "Enable TAT breach notifications"');
CALL AddColIfMissing('investigationsettings', 'LabTATAlertMinutes',
    'INT NOT NULL DEFAULT 60 COMMENT "TAT threshold (minutes) before alert fires"');

-- =============================================================
-- 6.  hims_assets  —  LIS connection info for bidirectional mode
-- =============================================================
CALL AddColIfMissing('hims_assets', 'LISProtocol',
    'VARCHAR(20) NULL DEFAULT NULL COMMENT "ASTM E1381 | HL7 v2 | custom | serial"');
CALL AddColIfMissing('hims_assets', 'LISHost',
    'VARCHAR(255) NULL DEFAULT NULL COMMENT "Analyser IP / hostname"');
CALL AddColIfMissing('hims_assets', 'LISPort',
    'INT NULL DEFAULT NULL COMMENT "Analyser TCP port for bidirectional LIS"');
CALL AddColIfMissing('hims_assets', 'LISDeviceId',
    'VARCHAR(50) NULL DEFAULT NULL COMMENT "Device ID used in ASTM/HL7 messages"');
CALL AddColIfMissing('hims_assets', 'LISPollingIntervalSec',
    'INT NULL DEFAULT 30 COMMENT "Polling interval in seconds (bidirectional mode)"');

-- =============================================================
-- 7.  Index on FacilityId
-- =============================================================
DROP PROCEDURE IF EXISTS CreateIdxIfMissing;

DELIMITER $$
CREATE PROCEDURE CreateIdxIfMissing(
    IN p_tbl  VARCHAR(128),
    IN p_idx  VARCHAR(128),
    IN p_cols VARCHAR(256)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   INFORMATION_SCHEMA.STATISTICS
        WHERE  TABLE_SCHEMA = DATABASE()
          AND  TABLE_NAME   = p_tbl
          AND  INDEX_NAME   = p_idx
    ) THEN
        SET @ddl = CONCAT('CREATE INDEX `', p_idx, '` ON `', p_tbl, '` (', p_cols, ')');
        PREPARE s FROM @ddl;
        EXECUTE s;
        DEALLOCATE PREPARE s;
    END IF;
END$$
DELIMITER ;

CALL CreateIdxIfMissing('investigationsettings', 'idx_invsettings_facility', '`FacilityId`');

-- =============================================================
-- Cleanup helpers
-- =============================================================
DROP PROCEDURE IF EXISTS AddColIfMissing;
DROP PROCEDURE IF EXISTS CreateIdxIfMissing;

-- =============================================================
-- Verify — show final column list for investigationsettings
-- =============================================================
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM   INFORMATION_SCHEMA.COLUMNS
WHERE  TABLE_SCHEMA = DATABASE()
  AND  TABLE_NAME   = 'investigationsettings'
ORDER BY ORDINAL_POSITION;

-- =============================================================
-- Compatibility columns for Master models
-- =============================================================
-- ordertype: add Name column matching Ordertypee
ALTER TABLE ordertype ADD COLUMN IF NOT EXISTS Name VARCHAR(60) NULL;
UPDATE ordertype SET Name = Ordertypee WHERE Name IS NULL;

-- prioritystatus: add Name column matching Orderprioritye
ALTER TABLE prioritystatus ADD COLUMN IF NOT EXISTS Name VARCHAR(60) NULL;
UPDATE prioritystatus SET Name = Orderprioritye WHERE Name IS NULL;

-- analysernormaltemplate: add NoOfPendingServices column if referenced by model
ALTER TABLE analysernormaltemplate ADD COLUMN IF NOT EXISTS NoOfPendingServices INT NULL DEFAULT 0;

