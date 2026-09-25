ALTER TABLE `posts` ADD `author_name` text DEFAULT 'Rédaction' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `publisher_visitor_id` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `rate_key` text;--> statement-breakpoint
CREATE INDEX `idx_posts_rate_key_created` ON `posts` (`rate_key`,`created_at`);