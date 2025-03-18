-- InitializeDatabase.sql

-- Create TranscriptionUsers table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TranscriptionUsers" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user" TEXT UNIQUE
);

-- Create TranscriptionImages table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TranscriptionImages" (
    "id" TEXT PRIMARY KEY,
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
    "date" INTEGER
);

-- Create TranscriptionTexts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "TranscriptionTexts" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "transcription_id" INTEGER REFERENCES "Transcriptions"("id"),
    "start_verse" INTEGER,
    "end_verse" INTEGER,
    "text" TEXT
);