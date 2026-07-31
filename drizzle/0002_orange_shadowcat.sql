CREATE TABLE `follows` (
	`creator_email` text NOT NULL,
	`follower_email` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`creator_email`, `follower_email`),
	FOREIGN KEY (`creator_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`follower_email`) REFERENCES `profiles`(`email`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `follows_creator_idx` ON `follows` (`creator_email`);--> statement-breakpoint
CREATE INDEX `follows_follower_idx` ON `follows` (`follower_email`);