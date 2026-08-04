ALTER TABLE `TranscriptionImages` ADD `updated` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE `TranscriptionImages` SET `updated` = COALESCE(`created`, 0);--> statement-breakpoint
CREATE INDEX `idx_images_user_updated` ON `TranscriptionImages` (`user_id`,`updated`,`id`);--> statement-breakpoint
CREATE INDEX `idx_transcriptions_image_date` ON `Transcriptions` (`image_id`,`date`);