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
