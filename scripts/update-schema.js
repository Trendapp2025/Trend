// Script to update the database schema
import { exec } from "child_process";
import fs from "fs";

// Create a temporary SQL file with the required queries
const tempSqlPath = "./temp-schema-update.sql";

const sqlQueries = `
-- Add the current_badge column to the users table if it does not exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'current_badge'
    ) THEN 
        ALTER TABLE users ADD COLUMN current_badge text;
    END IF;
END $$;

-- Create the enum type badge_type if it does not exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'badge_type'
    ) THEN 
        CREATE TYPE badge_type AS ENUM ('top1', 'top2', 'top3', 'top4', 'top5');
    END IF;
END $$;

-- Create the user_badges table if it does not exist
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    username TEXT NOT NULL,
    badge_type TEXT NOT NULL,
    month_year TEXT NOT NULL,
    accuracy_percentage DECIMAL DEFAULT 0 NOT NULL,
    total_predictions INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
`;

fs.writeFileSync(tempSqlPath, sqlQueries);

// Execute the SQL script
const command = `PGPASSWORD="${process.env.PGPASSWORD}" psql -h ${process.env.PGHOST} -p ${process.env.PGPORT} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} -f ${tempSqlPath}`;

console.log("Updating schema...");
exec(command, (error, stdout, stderr) => {
  // Remove the temporary file
  fs.unlinkSync(tempSqlPath);

  if (error) {
    console.error(`Error while updating the schema:`, error);
    return;
  }

  if (stderr) {
    console.error(`Warnings during schema update:`, stderr);
  }

  console.log("Output:", stdout);
  console.log("Schema updated successfully!");
});
