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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
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
