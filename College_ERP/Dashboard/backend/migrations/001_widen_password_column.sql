-- Run ONCE in MySQL (database: srm_attendance) before starting the upgraded server.
-- Hashed passwords are 60 characters long; a short column would reject them.
ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL;

-- Optional but recommended: stop two accounts sharing one email.
-- This fails if duplicate emails already exist - clean those up first.
-- ALTER TABLE users ADD UNIQUE KEY uq_users_email (email);
