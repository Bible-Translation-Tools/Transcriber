CREATE TABLE `TranscriptionImages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`user_deleted` integer NOT NULL,
	`file_path` text NOT NULL,
	`file_name` text NOT NULL,
	`language_code` text NOT NULL,
	`book_code` text NOT NULL,
	`chapter` integer NOT NULL,
	`verse_start` integer NOT NULL,
	`verse_end` integer NOT NULL,
	`created` integer,
	FOREIGN KEY (`user_id`) REFERENCES `TranscriptionUsers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `TranscriptionUsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `TranscriptionUsers_user_unique` ON `TranscriptionUsers` (`user`);--> statement-breakpoint
CREATE TABLE `Transcriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_id` text,
	`human_modified` integer NOT NULL,
	`model` text NOT NULL,
	`prompt` text NOT NULL,
	`system_prompt` text NOT NULL,
	`date` integer NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`image_id`) REFERENCES `TranscriptionImages`(`id`) ON UPDATE no action ON DELETE no action
);
