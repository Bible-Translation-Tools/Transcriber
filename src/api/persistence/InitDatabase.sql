-- InitializeDatabase.sql

-- Create TranscriptionUsers table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TranscriptionUsers" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user" TEXT UNIQUE
);

-- Create TranscriptionImages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TranscriptionImages" (
    "id" TEXT PRIMARY KEY,
    "user_deleted" INTEGER,
    "user_id" INTEGER REFERENCES "TranscriptionUsers"("id"),
    "file_path" TEXT,
    "language_code" TEXT,
    "book_code" TEXT,
    "chapter" INTEGER,
    "verse_start" INTEGER,
    "verse_end" INTEGER
);

-- Create Transcriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Transcriptions" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "image_id" TEXT REFERENCES "TranscriptionImages"("id"),
    "human_modified" INTEGER,
    "model" TEXT,
    "prompt" TEXT,
    "system_prompt" TEXT,
    "date" INTEGER,
    "text" TEXT
);