ALTER TABLE `posts` ADD `series` text;--> statement-breakpoint
ALTER TABLE `posts` ADD `series_order` integer;--> statement-breakpoint
CREATE INDEX `posts_series_order_idx` ON `posts` (`series`,`series_order`);