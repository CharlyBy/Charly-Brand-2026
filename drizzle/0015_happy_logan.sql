CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rating` int NOT NULL,
	`text` text,
	`name` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`anonymityLevel` enum('full','first_initial','initials','anonymous') NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
