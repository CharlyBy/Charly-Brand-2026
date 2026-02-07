CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','unpaid','incomplete','trialing') NOT NULL,
	`currentPeriodStart` timestamp NOT NULL,
	`currentPeriodEnd` timestamp NOT NULL,
	`cancelAtPeriodEnd` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_stripeCustomerId_unique` UNIQUE(`stripeCustomerId`),
	CONSTRAINT `subscriptions_stripeSubscriptionId_unique` UNIQUE(`stripeSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `conversations` ADD `userTier` enum('free','premium') DEFAULT 'free' NOT NULL;