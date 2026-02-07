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
