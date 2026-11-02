-- Creates the database and tables from scratch (safe to run more than once).
-- Use this on a NEW MySQL server, for example inside a GitHub Codespace:
--   sudo mysql < migrations/000_schema.sql
-- It matches the tables the server expects: users(id, name, email, password, created_at)
-- and attendance(id, user_id, status, recorded_at, source).

CREATE DATABASE IF NOT EXISTS srm_attendance;
USE srm_attendance;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'present',
  recorded_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source       VARCHAR(50)  NOT NULL DEFAULT 'face-system',
  CONSTRAINT attendance_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
