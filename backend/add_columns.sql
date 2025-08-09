-- Add language and framework columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'JavaScript';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS framework VARCHAR(50) DEFAULT 'Web';

-- Update existing projects with default values
UPDATE projects SET language = 'JavaScript', framework = 'Web' WHERE language IS NULL OR framework IS NULL;
