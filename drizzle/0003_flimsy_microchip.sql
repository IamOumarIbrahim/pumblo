ALTER TABLE `profiles` ADD `avatar_object_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `banner_object_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `duration_seconds` real DEFAULT 0 NOT NULL;