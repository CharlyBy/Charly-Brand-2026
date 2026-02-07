CREATE TABLE `conversations` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64),
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`enneagramType` varchar(32),
	`mainTopic` text,
	`intensity` int,
	`outcome` enum('trance','appointment','abort','ongoing'),
	`emergencyFlag` int NOT NULL DEFAULT 0,
	`email` varchar(320),
	`firstName` varchar(100),
	`recommendation` text,
	`enneagram_confidence` real,
	`enneagram_answers` text,
	`enneagram_analysis` text,
	`userTier` enum('free','premium') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enneagram_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_name` varchar(100) NOT NULL,
	`user_email` varchar(320) NOT NULL,
	`primary_type` int NOT NULL,
	`wing` varchar(10),
	`confidence` real NOT NULL,
	`analysis_json` text NOT NULL,
	`answers_json` text NOT NULL,
	`conversation_id` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enneagram_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(50) NOT NULL,
	`thumbnailPath` varchar(255) NOT NULL,
	`pdfPath` varchar(255) NOT NULL,
	`pageCount` int NOT NULL,
	`readingTime` int NOT NULL,
	`published` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `knowledge_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`sender` enum('luna','user') NOT NULL,
	`content` text NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalChats` int NOT NULL DEFAULT 0,
	`tranceSales` int NOT NULL DEFAULT 0,
	`appointmentsBooked` int NOT NULL DEFAULT 0,
	`topics` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`stripeCustomerId` varchar(255) NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`status` enum('active','canceled','past_due','unpaid','incomplete','incomplete_expired','trialing','paused') NOT NULL,
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
CREATE TABLE `tranceSessions` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64),
	`userId` int,
	`enneagramType` varchar(32) NOT NULL,
	`mainTopic` text NOT NULL,
	`scriptContent` text NOT NULL,
	`audioUrl` text NOT NULL,
	`duration` int,
	`isPaid` int NOT NULL DEFAULT 0,
	`email` varchar(320),
	`firstName` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tranceSessions_id` PRIMARY KEY(`id`)
);
