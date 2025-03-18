import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const transcriptionUsers = sqliteTable("TranscriptionUsers", {
    id: integer("id").primaryKey({autoIncrement: true}),
    user: text("user").unique(),
})

export const transcriptionImages = sqliteTable('TranscriptionImages', {
    id: text('id').primaryKey(),
    userId: text("user_id").references(() => transcriptionUsers.id),
    filePath: text('file_path'),
    languageCode: text('language_code'),
    bookCode: text('book_code'),
    chapter: integer('chapter'),
    verseStart: integer('verse_start'),
    verseEnd: integer('verse_end'),
});

export const transcriptions = sqliteTable('Transcriptions', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    imageId: text('image_id').references(() => transcriptionImages.id),
    humanModified: integer('human_modified'),
    model: text('model'),
    prompt: text('prompt'),
    systemPrompt: text('system_prompt'),
    date: integer('date'),
});

export const transcriptionTexts = sqliteTable('TranscriptionTexts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    transcriptionId: integer('transcription_id').references(() => transcriptions.id),
    startVerse: integer('start_verse'),
    endVerse: integer('end_verse'),
    text: text('text'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content'),
});

export type Message = typeof messages.$inferSelect;