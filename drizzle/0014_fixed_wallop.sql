CREATE TABLE `article_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`chunkText` text NOT NULL,
	`embedding` text NOT NULL,
	`pageNumber` int,
	`chunkIndex` int NOT NULL,
	`enabledForLuna` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `article_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`deviceType` enum('desktop','mobile','tablet') NOT NULL,
	`timeSpent` int NOT NULL,
	`scrollDepth` int NOT NULL,
	`bounced` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_views_id` PRIMARY KEY(`id`)
);
