import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const transcriptionUsers = sqliteTable("TranscriptionUsers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	user: text("user").unique().notNull(),
});

export const transcriptionImages = sqliteTable("TranscriptionImages", {
	id: text("id").primaryKey(),
	userId: integer("user_id")
		.references(() => transcriptionUsers.id)
		.notNull(),
	userDeleted: integer("user_deleted", { mode: "boolean" }).notNull(),
	filePath: text("file_path").notNull(),
	filename: text("file_name").notNull(),
	languageCode: text("language_code").notNull(),
	bookCode: text("book_code").notNull(),
	chapter: integer("chapter").notNull(),
	verseStart: integer("verse_start").notNull(),
	verseEnd: integer("verse_end").notNull(),
	created: integer("created").$defaultFn(() => Date.now()),
});

export const transcriptions = sqliteTable("Transcriptions", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	imageId: text("image_id").references(() => transcriptionImages.id),
	humanModified: integer("human_modified", { mode: "boolean" }).notNull(),
	model: text("model").notNull(),
	prompt: text("prompt").notNull(),
	systemPrompt: text("system_prompt").notNull(),
	date: integer("date")
		.notNull()
		.$defaultFn(() => Date.now()),
	text: text("text").notNull(),
});
