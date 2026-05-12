-- Migration Script to move Security Parameters to the Facilities Table

-- 1. Add DefaultPwd and MaxFailedLoginAttempts columns to facilities table
ALTER TABLE facilities 
ADD COLUMN DefaultPwd VARCHAR(50) DEFAULT 'Default@123',
ADD COLUMN MaxFailedLoginAttempts INT DEFAULT 10;

-- Note: The data is now mapped directly to the facilities table.
-- The legacy columns inside facilitysettings are now safely deprecated.
