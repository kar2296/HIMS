-- ============================================================================
-- EMR Workspace: per-form panel settings (nickname + mandatory flag)
-- Used by: EMR Form Assembly (admin) and the EMR Workspace tab bar / Complete check.
-- Safe to run more than once. Does not change any existing table.
-- ============================================================================
CREATE TABLE IF NOT EXISTS `emr_profile_section_settings` (
    `Id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `ProfileId`   BIGINT       NOT NULL COMMENT 'hims_templatescreens.ProfileId (EMR form)',
    `SectionId`   BIGINT       NOT NULL COMMENT 'hims_templatetabs.SectionId (EMR panel)',
    `NickName`    VARCHAR(150) NULL     COMMENT 'Tab label override for this form',
    `IsMandatory` TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Must be filled before Complete',
    `Status`      INT          NOT NULL DEFAULT 1,
    `Rev`         INT          NULL,
    `CreatedBy`   INT          NULL,
    `CreatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedBy`   INT          NULL,
    `UpdatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`Id`),
    KEY `idx_epss_profile` (`ProfileId`, `Status`),
    KEY `idx_epss_profile_section` (`ProfileId`, `SectionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
