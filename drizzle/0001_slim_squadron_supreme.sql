CREATE TABLE `publicationScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicationId` int NOT NULL,
	`userId` int NOT NULL,
	`baseScore` decimal(10,2) DEFAULT '10',
	`recencyBonus` decimal(10,2) DEFAULT '0',
	`impactBonus` decimal(10,2) DEFAULT '0',
	`totalScore` decimal(10,2) NOT NULL,
	`computedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publicationScores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`doi` varchar(255) NOT NULL,
	`title` text NOT NULL,
	`authors` json NOT NULL,
	`journal` varchar(255),
	`year` int,
	`abstract` text,
	`publicationType` enum('journal-article','conference-proceeding','book','book-chapter','preprint','other') DEFAULT 'journal-article',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publications_id` PRIMARY KEY(`id`),
	CONSTRAINT `doi_userId_idx` UNIQUE(`doi`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `rankingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` decimal(10,2) NOT NULL,
	`rank` int,
	`publicationCount` int,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rankingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`score` decimal(10,2) NOT NULL DEFAULT '0',
	`rank` int,
	`publicationCount` int DEFAULT 0,
	`computedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userRatings_id` PRIMARY KEY(`id`),
	CONSTRAINT `userRatings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `field` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `institution` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `orcidId` varchar(64);--> statement-breakpoint
CREATE INDEX `publicationId_idx` ON `publicationScores` (`publicationId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `publicationScores` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `publications` (`userId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `rankingHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `recordedAt_idx` ON `rankingHistory` (`recordedAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `userRatings` (`userId`);--> statement-breakpoint
CREATE INDEX `score_idx` ON `userRatings` (`score`);--> statement-breakpoint
CREATE INDEX `rank_idx` ON `userRatings` (`rank`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `orcid_idx` ON `users` (`orcidId`);