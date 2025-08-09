-- Add language and framework columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'JavaScript';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS framework VARCHAR(50) DEFAULT 'Web';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS repository_url TEXT;

-- Create screenshots table if not exists
CREATE TABLE IF NOT EXISTS screenshots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    commit_hash VARCHAR(40),
    url TEXT,
    file_path VARCHAR(500) NOT NULL,
    user_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Update existing projects with default values
UPDATE projects SET language = 'JavaScript', framework = 'Web' WHERE language IS NULL OR framework IS NULL;
