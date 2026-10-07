-- 1. Add DefaultPwd and MaxFailedLoginAttempts columns to facilities table
ALTER TABLE facilities 
ADD COLUMN DefaultPwd VARCHAR(50) DEFAULT 'Default@123',
ADD COLUMN MaxFailedLoginAttempts INT DEFAULT 10;

-- 2. Add MaxFailedLoginAttempts column to facilitysettings table to match model
ALTER TABLE facilitysettings 
ADD COLUMN MaxFailedLoginAttempts INT DEFAULT 10;

-- 3. Ensure default facilitysettings row exists for Facility 1
INSERT IGNORE INTO facilitysettings (
    FacilitySettingId, FacilityId, MinLoginNameLength, MaxLoginNameLength, ReqNoOfLoginDigit, 
    MinPwdLength, MaxPwdLength, IsSpecialCharacterAllowedinPwd, DefaultPwd, 
    Status, Rev, CreatedBy, CreatedAt, UpdatedBy, UpdatedAt, MaxFailedLoginAttempts
) VALUES (
    1, 1, 1, 30, 0, 
    6, 30, 1, 'Password@123', 
    1, 1, 1, NOW(), 1, NOW(), 5
);

-- Ensure existing facilitysettings row uses min login name length of 1 for backward compatibility
UPDATE facilitysettings SET MinLoginNameLength = 1 WHERE FacilitySettingId = 1;

-- 4. Create usercategorymap table required by UserBo AddUser and UpdateUser
CREATE TABLE IF NOT EXISTS `usercategorymap` (
  `Id` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserId` bigint(20) NOT NULL,
  `CategoryId` bigint(20) DEFAULT NULL,
  `CreatedBy` bigint(20) DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  `UpdatedBy` bigint(20) DEFAULT NULL,
  `UpdatedAt` datetime DEFAULT NULL,
  `Rev` int(11) DEFAULT '0',
  `Status` int(11) DEFAULT '1',
  PRIMARY KEY (`Id`),
  KEY `Idx_user_cat1` (`UserId`),
  KEY `Idx_user_cat2` (`CategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
