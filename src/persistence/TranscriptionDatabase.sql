-- Table: TranscriptionImages
CREATE TABLE TranscriptionImages (
    id TEXT PRIMARY KEY,
    data TEXT, -- Base64 encoded image data
    language_code TEXT,
    book_code TEXT,
    chapter INTEGER,
    verse_start INTEGER,
    verse_end INTEGER
);

-- Table: Transcriptions
CREATE TABLE Transcriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id TEXT,
    human_modified INTEGER, -- 0 for false, 1 for true
    model TEXT,
    prompt TEXT,
    system_prompt TEXT,
    date INTEGER, -- Epoch timestamp
    FOREIGN KEY (image_id) REFERENCES TranscriptionImages(id)
);

-- Table: TranscriptionTexts
CREATE TABLE TranscriptionTexts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transcription_id INTEGER,
    start_verse INTEGER,
    end_verse INTEGER,
    text TEXT,
    FOREIGN KEY (transcription_id) REFERENCES Transcriptions(id)
);