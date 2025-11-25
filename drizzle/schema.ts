import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow and profile management.
 * Extended with NeuroSciRank-specific fields for researcher profiles.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    passwordHash: varchar("passwordHash", { length: 255 }), // For email/password auth
    loginMethod: varchar("loginMethod", { length: 64 }), // 'manus', 'email', 'orcid'
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    
    // NeuroSciRank profile fields
    field: varchar("field", { length: 255 }), // Research field/specialization
    institution: varchar("institution", { length: 255 }), // Institution name
    bio: text("bio"), // Short biography
    orcidId: varchar("orcidId", { length: 64 }), // For future ORCID integration
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    orcidIdx: index("orcid_idx").on(table.orcidId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Publications table - stores research papers added by users via DOI.
 * Metadata is fetched from Crossref API and stored locally.
 */
export const publications = mysqlTable(
  "publications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(), // FK to users
    doi: varchar("doi", { length: 255 }).notNull(), // Digital Object Identifier
    title: text("title").notNull(),
    authors: json("authors").$type<string[]>().notNull(), // Array of author names
    journal: varchar("journal", { length: 255 }), // Journal/venue name
    year: int("year"), // Publication year
    abstract: text("abstract"), // Optional abstract
    publicationType: mysqlEnum("publicationType", [
      "journal-article",
      "conference-proceeding",
      "book",
      "book-chapter",
      "preprint",
      "other",
    ]).default("journal-article"), // Publication type from Crossref
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    doiIdx: uniqueIndex("doi_userId_idx").on(table.doi, table.userId), // Unique per user
  })
);

export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;

/**
 * UserRating table - stores computed ranking scores for users.
 * Updated weekly by background job. Stores historical snapshots.
 */
export const userRatings = mysqlTable(
  "userRatings",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(), // FK to users (one rating per user)
    score: decimal("score", { precision: 10, scale: 2 }).notNull().default("0"), // Total score
    rank: int("rank"), // Global rank (1 = highest score)
    publicationCount: int("publicationCount").default(0), // Number of publications
    computedAt: timestamp("computedAt").defaultNow().notNull(), // When score was calculated
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    scoreIdx: index("score_idx").on(table.score),
    rankIdx: index("rank_idx").on(table.rank),
  })
);

export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = typeof userRatings.$inferInsert;

/**
 * PublicationScores table - detailed scoring breakdown for each publication.
 * Helps with transparency and debugging of ranking algorithm.
 */
export const publicationScores = mysqlTable(
  "publicationScores",
  {
    id: int("id").autoincrement().primaryKey(),
    publicationId: int("publicationId").notNull(), // FK to publications
    userId: int("userId").notNull(), // FK to users (denormalized for query efficiency)
    baseScore: decimal("baseScore", { precision: 10, scale: 2 }).default("10"), // Base points per publication
    recencyBonus: decimal("recencyBonus", { precision: 10, scale: 2 }).default("0"), // Bonus based on year
    impactBonus: decimal("impactBonus", { precision: 10, scale: 2 }).default("0"), // Bonus for high-impact journals
    totalScore: decimal("totalScore", { precision: 10, scale: 2 }).notNull(), // Sum of all bonuses
    computedAt: timestamp("computedAt").defaultNow().notNull(),
  },
  (table) => ({
    publicationIdIdx: index("publicationId_idx").on(table.publicationId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type PublicationScore = typeof publicationScores.$inferSelect;
export type InsertPublicationScore = typeof publicationScores.$inferInsert;

/**
 * RankingHistory table - audit trail of ranking changes over time.
 * Useful for analytics and tracking user progression.
 */
export const rankingHistory = mysqlTable(
  "rankingHistory",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(), // FK to users
    score: decimal("score", { precision: 10, scale: 2 }).notNull(),
    rank: int("rank"),
    publicationCount: int("publicationCount"),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("userId_idx").on(table.userId),
    recordedAtIdx: index("recordedAt_idx").on(table.recordedAt),
  })
);

export type RankingHistory = typeof rankingHistory.$inferSelect;
export type InsertRankingHistory = typeof rankingHistory.$inferInsert;
