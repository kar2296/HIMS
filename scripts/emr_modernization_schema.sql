-- ============================================================================
-- HIMS EMR Modernization — Complete Database Schema DDL
-- Tables for EMR Hub, Workstations, eMAR, Discharge, and Governance
-- ============================================================================

-- 1. EMR Discharge Summaries Table
CREATE TABLE IF NOT EXISTS `emr_discharge_summaries` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NOT NULL,
    `AdmissionDate` DATETIME NOT NULL,
    `DischargeDate` DATETIME NOT NULL,
    `AdmissionDiagnosis` VARCHAR(500) NOT NULL,
    `FinalDiagnosis` VARCHAR(500) NOT NULL,
    `HospitalCourse` TEXT NOT NULL,
    `SurgicalProcedures` TEXT NULL,
    `DischargeCondition` ENUM('STABLE', 'IMPROVED', 'TRANSFERRED', 'LAMA', 'DECEASED') NOT NULL DEFAULT 'STABLE',
    `FollowupDate` DATE NULL,
    `FollowupInstructions` TEXT NULL,
    `DischargingDoctorId` BIGINT NOT NULL,
    `DischargingDoctorName` VARCHAR(255) NOT NULL,
    `IsSigned` TINYINT(1) NOT NULL DEFAULT 0,
    `SignedAt` DATETIME NULL,
    `SignedBy` VARCHAR(255) NULL,
    `Rev` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ds_patient` (`PatientId`),
    INDEX `idx_ds_encounter` (`EncounterId`),
    INDEX `idx_ds_signed` (`IsSigned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Discharge Summary Medication Reconciliation Line Items
CREATE TABLE IF NOT EXISTS `emr_discharge_medications` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `DischargeSummaryId` BIGINT NOT NULL,
    `DrugName` VARCHAR(255) NOT NULL,
    `Dosage` VARCHAR(100) NOT NULL,
    `Route` VARCHAR(50) NOT NULL,
    `Frequency` VARCHAR(50) NOT NULL,
    `DurationDays` INT NOT NULL,
    `TotalQuantity` INT NOT NULL,
    `Instructions` VARCHAR(500) NULL,
    `MedicationType` ENUM('CONTINUED_HOME', 'DISCONTINUED_HOSPITAL', 'NEW_POST_DISCHARGE') NOT NULL DEFAULT 'NEW_POST_DISCHARGE',
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_dm_summary` (`DischargeSummaryId`),
    FOREIGN KEY (`DischargeSummaryId`) REFERENCES `emr_discharge_summaries` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Discharge Summary Audit Log
CREATE TABLE IF NOT EXISTS `emr_discharge_summary_audits` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `DischargeSummaryId` BIGINT NOT NULL,
    `ActionType` ENUM('DRAFT_SAVED', 'SIGNED', 'AMENDED', 'EXPORTED', 'PRINTED') NOT NULL,
    `UserId` BIGINT NOT NULL,
    `UserName` VARCHAR(255) NOT NULL,
    `UserRole` VARCHAR(100) NOT NULL,
    `Justification` VARCHAR(500) NULL,
    `IpAddress` VARCHAR(45) NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_dsa_summary` (`DischargeSummaryId`),
    FOREIGN KEY (`DischargeSummaryId`) REFERENCES `emr_discharge_summaries` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. EMR Form Assembly & Specialty Panels Master
CREATE TABLE IF NOT EXISTS `emr_form_assemblies` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `FormCode` VARCHAR(100) NOT NULL UNIQUE,
    `FormName` VARCHAR(255) NOT NULL,
    `PanelType` ENUM('STANDARD', 'CUSTOM') NOT NULL DEFAULT 'STANDARD',
    `IsSystemDefault` TINYINT(1) NOT NULL DEFAULT 0,
    `DepartmentId` BIGINT NULL,
    `SpecialtyCategory` ENUM('GENERAL', 'CARDIOLOGY', 'DENTAL', 'OPHTHALMOLOGY', 'OBGYN', 'ANESTHESIA', 'PHYSIOTHERAPY', 'PEDIATRICS') NOT NULL DEFAULT 'GENERAL',
    `FormSchemaJson` LONGTEXT NOT NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `CreatedBy` VARCHAR(255) NOT NULL,
    `Rev` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_fa_panel_type` (`PanelType`),
    INDEX `idx_fa_specialty` (`SpecialtyCategory`),
    INDEX `idx_fa_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4a. EMR Form Assembly Sections Table
CREATE TABLE IF NOT EXISTS `emr_form_sections` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `FormAssemblyId` BIGINT NOT NULL,
    `SectionCode` VARCHAR(100) NOT NULL,
    `SectionTitle` VARCHAR(255) NOT NULL,
    `IsRequired` TINYINT(1) NOT NULL DEFAULT 1,
    `RequirementType` ENUM('MANDATORY', 'OPTIONAL', 'CONDITIONAL') NOT NULL DEFAULT 'MANDATORY',
    `DisplayOrder` INT NOT NULL DEFAULT 0,
    `Rev` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_fs_form` (`FormAssemblyId`),
    FOREIGN KEY (`FormAssemblyId`) REFERENCES `emr_form_assemblies` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4b. EMR Form Clinical Fields Table
CREATE TABLE IF NOT EXISTS `emr_form_fields` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `SectionId` BIGINT NOT NULL,
    `FieldCode` VARCHAR(100) NOT NULL,
    `FieldLabel` VARCHAR(255) NOT NULL,
    `FieldType` ENUM('TEXT', 'NUMBER', 'TEXTAREA', 'DROPDOWN', 'CHECKBOX', 'DATE', 'RADIO', 'ODONTOGRAM', 'VA_CHART') NOT NULL DEFAULT 'TEXT',
    `RequirementType` ENUM('MANDATORY', 'OPTIONAL', 'CONDITIONAL') NOT NULL DEFAULT 'MANDATORY',
    `DefaultValue` VARCHAR(255) NULL,
    `Placeholder` VARCHAR(255) NULL,
    `OptionsJson` JSON NULL,
    `Unit` VARCHAR(50) NULL,
    `IsRequired` TINYINT(1) NOT NULL DEFAULT 1,
    `MinVal` DECIMAL(10,2) NULL,
    `MaxVal` DECIMAL(10,2) NULL,
    `DisplayOrder` INT NOT NULL DEFAULT 0,
    `Rev` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_ff_section` (`SectionId`),
    FOREIGN KEY (`SectionId`) REFERENCES `emr_form_sections` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. EMR Master Catalogs (Allergies, Vaccines, Lines/Drains/Tubes, Scales)
CREATE TABLE IF NOT EXISTS `emr_masters_catalogs` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `CatalogType` ENUM('ALLERGY_TYPE', 'ALLERGY_REACTION', 'VACCINE', 'LINE_DRAIN_TUBE', 'ASSESSMENT_SCALE', 'DRUG_SCHEDULE', 'SURGICAL_CHECKLIST') NOT NULL,
    `ItemCode` VARCHAR(100) NOT NULL,
    `ItemName` VARCHAR(255) NOT NULL,
    `Description` VARCHAR(500) NULL,
    `DefaultSeverity` ENUM('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING') NULL,
    `MetadataJson` JSON NULL,
    `IsActive` TINYINT(1) NOT NULL DEFAULT 1,
    `DisplayOrder` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_catalog_item` (`CatalogType`, `ItemCode`),
    INDEX `idx_mc_type` (`CatalogType`),
    INDEX `idx_mc_active` (`IsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Inpatient eMAR Administration Records
CREATE TABLE IF NOT EXISTS `emr_inpatient_emar` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PrescriptionDetailId` BIGINT NOT NULL,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NOT NULL,
    `DrugName` VARCHAR(255) NOT NULL,
    `Dosage` VARCHAR(100) NOT NULL,
    `Route` VARCHAR(50) NOT NULL,
    `ScheduledDate` DATE NOT NULL,
    `ScheduledTime` VARCHAR(10) NOT NULL,
    `Status` ENUM('DUE', 'GIVEN', 'HELD', 'REFUSED', 'MISSED') NOT NULL DEFAULT 'DUE',
    `GivenAt` DATETIME NULL,
    `GivenBy` VARCHAR(255) NULL,
    `HeldOrRefusedReason` VARCHAR(500) NULL,
    `FiveRightsVerified` TINYINT(1) NOT NULL DEFAULT 0,
    `Notes` VARCHAR(500) NULL,
    `Rev` INT NOT NULL DEFAULT 0,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_emar_patient` (`PatientId`),
    INDEX `idx_emar_date_time` (`ScheduledDate`, `ScheduledTime`),
    INDEX `idx_emar_status` (`Status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Inpatient Fluid Balance Chart (I/O)
CREATE TABLE IF NOT EXISTS `emr_fluid_balance_entries` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NOT NULL,
    `RecordedAt` DATETIME NOT NULL,
    `Type` ENUM('INTAKE', 'OUTPUT') NOT NULL,
    `Route` VARCHAR(50) NOT NULL,
    `VolumeMl` INT NOT NULL,
    `Description` VARCHAR(255) NOT NULL,
    `RecordedBy` VARCHAR(255) NOT NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fb_patient_encounter` (`PatientId`, `EncounterId`),
    INDEX `idx_fb_time` (`RecordedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Structured ISBAR Nursing Handover
CREATE TABLE IF NOT EXISTS `emr_isbar_handovers` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NOT NULL,
    `Shift` ENUM('MORNING_TO_EVENING', 'EVENING_TO_NIGHT', 'NIGHT_TO_MORNING') NOT NULL,
    `HandoverDate` DATETIME NOT NULL,
    `OutgoingNurse` VARCHAR(255) NOT NULL,
    `IncomingNurse` VARCHAR(255) NULL,
    `Status` ENUM('DRAFT', 'COMPLETED', 'ACKNOWLEDGED') NOT NULL DEFAULT 'DRAFT',
    `IdentificationJson` JSON NOT NULL,
    `SituationJson` JSON NOT NULL,
    `BackgroundJson` JSON NOT NULL,
    `AssessmentJson` JSON NOT NULL,
    `RecommendationJson` JSON NOT NULL,
    `AcknowledgedAt` DATETIME NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_isbar_patient` (`PatientId`),
    INDEX `idx_isbar_shift` (`Shift`, `HandoverDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Clinical Decision Support (CDS) & Safety Telemetry Events
CREATE TABLE IF NOT EXISTS `emr_cds_alert_events` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NULL,
    `RuleType` ENUM('DRUG_ALLERGY', 'DRUG_DRUG_INTERACTION', 'CRITICAL_VITALS', 'DUPLICATE_ORDER', 'MAX_DOSE_EXCEEDED') NOT NULL,
    `Severity` ENUM('CRITICAL', 'HIGH', 'MODERATE', 'LOW') NOT NULL,
    `AlertMessage` VARCHAR(500) NOT NULL,
    `ClinicianId` BIGINT NOT NULL,
    `ClinicianName` VARCHAR(255) NOT NULL,
    `Decision` ENUM('ACCEPTED_AND_CANCELLED', 'OVERRIDDEN', 'MODIFIED_DOSE', 'ACKNOWLEDGED') NOT NULL,
    `OverrideReason` VARCHAR(500) NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_cds_patient` (`PatientId`),
    INDEX `idx_cds_rule` (`RuleType`),
    INDEX `idx_cds_decision` (`Decision`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. HIPAA Clinical Audit Log
CREATE TABLE IF NOT EXISTS `emr_clinical_audit_logs` (
    `Id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `PatientId` BIGINT NOT NULL,
    `EncounterId` BIGINT NULL,
    `EventType` ENUM('VIEW', 'MODIFY', 'ALLERGY_OVERRIDE', 'NOTE_AMENDMENT', 'CONCURRENCY_CONFLICT', 'BREAK_GLASS') NOT NULL,
    `UserId` BIGINT NOT NULL,
    `UserName` VARCHAR(255) NOT NULL,
    `UserRole` VARCHAR(100) NOT NULL,
    `ActionSummary` VARCHAR(500) NOT NULL,
    `Justification` VARCHAR(500) NULL,
    `OldStateJson` JSON NULL,
    `NewStateJson` JSON NULL,
    `IpAddress` VARCHAR(45) NULL,
    `UserAgent` VARCHAR(255) NULL,
    `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_cal_patient` (`PatientId`),
    INDEX `idx_cal_event` (`EventType`),
    INDEX `idx_cal_user` (`UserId`),
    INDEX `idx_cal_time` (`CreatedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
