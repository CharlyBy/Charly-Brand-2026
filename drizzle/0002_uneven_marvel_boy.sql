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
