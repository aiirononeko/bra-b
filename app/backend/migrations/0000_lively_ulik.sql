CREATE TABLE `evaluation_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evaluation_details` (
	`id` text PRIMARY KEY NOT NULL,
	`evaluation_id` text NOT NULL,
	`evaluation_item_id` text NOT NULL,
	FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluation_item_id`) REFERENCES `evaluation_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evaluation_items` (
	`id` text PRIMARY KEY NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`is_common` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`sort_order` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `evaluation_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `evaluations` (
	`id` text PRIMARY KEY NOT NULL,
	`barista_profile_id` text NOT NULL,
	`evaluator_user_id` text NOT NULL,
	`evaluated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`barista_profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`evaluator_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`barista_profile_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`barista_profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`display_name` text NOT NULL,
	`icon_url` text,
	`bio` text,
	`sns_links` text,
	`shop_name` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tips` (
	`id` text PRIMARY KEY NOT NULL,
	`barista_profile_id` text NOT NULL,
	`sender_user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`sent_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`payment_info` text,
	`message` text,
	`stripe_payment_intent_id` text,
	FOREIGN KEY (`barista_profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`auth_type` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE INDEX `evaluation_id_idx` ON `evaluation_details` (`evaluation_id`);--> statement-breakpoint
CREATE INDEX `evaluation_item_id_idx` ON `evaluation_details` (`evaluation_item_id`);--> statement-breakpoint
CREATE INDEX `category_id_idx` ON `evaluation_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `barista_profile_id_idx` ON `evaluations` (`barista_profile_id`);--> statement-breakpoint
CREATE INDEX `evaluator_user_id_idx` ON `evaluations` (`evaluator_user_id`);--> statement-breakpoint
CREATE INDEX `favorite_user_id_idx` ON `favorites` (`user_id`);--> statement-breakpoint
CREATE INDEX `favorite_barista_profile_id_idx` ON `favorites` (`barista_profile_id`);--> statement-breakpoint
CREATE INDEX `unique_user_barista_idx` ON `favorites` (`user_id`,`barista_profile_id`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `tip_barista_profile_id_idx` ON `tips` (`barista_profile_id`);--> statement-breakpoint
CREATE INDEX `sender_user_id_idx` ON `tips` (`sender_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);