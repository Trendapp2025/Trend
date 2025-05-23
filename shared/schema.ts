import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum per i tipi di badge
export const badgeTypeEnum = pgEnum("badge_type", ["top1", "top2", "top3", "top4", "top5"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  
  // User performance metrics
  totalPredictions: integer("total_predictions").default(0).notNull(),
  accuratePredictions: integer("accurate_predictions").default(0).notNull(),
  accuracyPercentage: decimal("accuracy_percentage").default("0").notNull(),
  advisorRating: decimal("advisor_rating").default("0").notNull(),
  
  // User profile fields
  bio: text("bio"),
  isVerifiedAdvisor: boolean("is_verified_advisor").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  
  // Badge attuale dell'utente (del mese precedente)
  currentBadge: text("current_badge"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull().unique(),
  type: text("type").notNull(), // crypto, stock, etc.
  sentiment: text("sentiment").default("neutral"),
  prediction: decimal("prediction").default("0"),
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  name: true,
  symbol: true,
  type: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Opinions table
export const opinions = pgTable("opinions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  sentiment: text("sentiment").notNull(), // positive, neutral, negative
  prediction: decimal("prediction").notNull(),
  comment: text("comment"),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOpinionSchema = createInsertSchema(opinions).pick({
  userId: true,
  assetId: true,
  sentiment: true,
  prediction: true,
  comment: true,
});

export type InsertOpinion = z.infer<typeof insertOpinionSchema>;
export type Opinion = typeof opinions.$inferSelect;

// User prediction results table - for tracking if predictions were accurate
export const predictionResults = pgTable("prediction_results", {
  id: serial("id").primaryKey(),
  opinionId: integer("opinion_id").notNull().references(() => opinions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  originalPrediction: decimal("original_prediction").notNull(),
  actualResult: decimal("actual_result").notNull(),
  wasAccurate: boolean("was_accurate").notNull(),
  verifiedAt: timestamp("verified_at").defaultNow(),
});

export const insertPredictionResultSchema = createInsertSchema(predictionResults).pick({
  opinionId: true,
  userId: true,
  assetId: true,
  originalPrediction: true,
  actualResult: true,
  wasAccurate: true,
});

export type InsertPredictionResult = z.infer<typeof insertPredictionResultSchema>;
export type PredictionResult = typeof predictionResults.$inferSelect;

// User leaderboard entries for monthly ranking
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  username: text("username").notNull(),
  totalPredictions: integer("total_predictions").default(0).notNull(),
  accuratePredictions: integer("accurate_predictions").default(0).notNull(),
  accuracyPercentage: decimal("accuracy_percentage").default("0").notNull(),
  rank: integer("rank").notNull(),
  monthYear: text("month_year").notNull(), // Format: "YYYY-MM"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
  username: true,
  totalPredictions: true,
  accuratePredictions: true,
  accuracyPercentage: true,
  rank: true,
  monthYear: true,
});

export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

// Email verification table
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).pick({
  userId: true,
  email: true,
  token: true,
  expiresAt: true,
});

export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;
export type EmailVerification = typeof emailVerifications.$inferSelect;

// User badge history table
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  username: text("username").notNull(),
  badgeType: text("badge_type").notNull(), // top1, top2, top3, top4, top5
  monthYear: text("month_year").notNull(), // Format: "YYYY-MM"
  accuracyPercentage: decimal("accuracy_percentage").default("0").notNull(),
  totalPredictions: integer("total_predictions").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).pick({
  userId: true,
  username: true, 
  badgeType: true,
  monthYear: true,
  accuracyPercentage: true,
  totalPredictions: true,
});

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
