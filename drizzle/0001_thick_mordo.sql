CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`parent_id` integer,
	`author_name` text NOT NULL,
	`body` text NOT NULL,
	`visitor_id` text NOT NULL,
	`rate_key` text NOT NULL,
	`is_author` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post_id` ON `comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_comments_rate_key_created` ON `comments` (`rate_key`,`created_at`);--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`visitor_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reactions_post_visitor` ON `reactions` (`post_id`,`visitor_id`);