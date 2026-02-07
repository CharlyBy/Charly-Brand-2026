CREATE TABLE `backups` (
	`id` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL,
	`size` int NOT NULL,
	`tables` text NOT NULL,
	`fileCount` int NOT NULL,
	`s3Url` varchar(500) NOT NULL,
	CONSTRAINT `backups_id` PRIMARY KEY(`id`)
);
