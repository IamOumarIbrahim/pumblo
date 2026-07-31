CREATE INDEX `comments_video_idx` ON `comments` (`video_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `likes_video_idx` ON `likes` (`video_id`);--> statement-breakpoint
CREATE INDEX `videos_owner_idx` ON `videos` (`owner_email`);--> statement-breakpoint
CREATE INDEX `videos_created_idx` ON `videos` (`created_at`);