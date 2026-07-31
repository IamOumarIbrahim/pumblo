CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_email` text NOT NULL,
	`actor_email` text NOT NULL,
	`type` text NOT NULL,
	`video_id` text DEFAULT '' NOT NULL,
	`series_id` text DEFAULT '' NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`recipient_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notifications_recipient_idx` ON `notifications` (`recipient_email`,`read`,`created_at`);--> statement-breakpoint
CREATE TABLE `profile_settings` (
	`user_email` text PRIMARY KEY NOT NULL,
	`autoplay_previews` integer DEFAULT 1 NOT NULL,
	`preview_sound` integer DEFAULT 1 NOT NULL,
	`data_saver` integer DEFAULT 0 NOT NULL,
	`reduced_motion` integer DEFAULT 0 NOT NULL,
	`autoplay_next` integer DEFAULT 1 NOT NULL,
	`prefer_longform` integer DEFAULT 1 NOT NULL,
	`notify_likes` integer DEFAULT 1 NOT NULL,
	`notify_comments` integer DEFAULT 1 NOT NULL,
	`notify_follows` integer DEFAULT 1 NOT NULL,
	`notify_series` integer DEFAULT 1 NOT NULL,
	`show_location` integer DEFAULT 1 NOT NULL,
	`show_socials` integer DEFAULT 1 NOT NULL,
	`show_follower_counts` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_email` text NOT NULL,
	`video_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`reporter_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reports_video_reporter_unique` ON `reports` (`video_id`,`reporter_email`);--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'ongoing' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `series_owner_idx` ON `series` (`owner_email`);--> statement-breakpoint
CREATE TABLE `watch_later` (
	`video_id` text NOT NULL,
	`user_email` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`video_id`, `user_email`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `watch_later_user_idx` ON `watch_later` (`user_email`,`created_at`);--> statement-breakpoint
CREATE TABLE `watch_progress` (
	`video_id` text NOT NULL,
	`user_email` text NOT NULL,
	`progress_seconds` real DEFAULT 0 NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`video_id`, `user_email`),
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `watch_progress_user_idx` ON `watch_progress` (`user_email`,`updated_at`);--> statement-breakpoint
ALTER TABLE `profiles` ADD `chatgpt_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `discord_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `x_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `github_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `youtube_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `series_id` text REFERENCES series(id);--> statement-breakpoint
ALTER TABLE `videos` ADD `season_number` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `episode_number` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `source_credit_url` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `original_size_bytes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `storage_savings_bytes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `videos_series_episode_unique` ON `videos` (`series_id`,`season_number`,`episode_number`) WHERE "videos"."series_id" IS NOT NULL AND "videos"."episode_number" > 0;