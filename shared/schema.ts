import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const inviteCodes = pgTable("invite_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("available"),
  usageCount: integer("usage_count").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(6),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastClaimedAt: timestamp("last_claimed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const codeUsages = pgTable("code_usages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviteCodeId: varchar("invite_code_id").notNull().references(() => inviteCodes.id, { onDelete: "cascade" }),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  status: text("status").notNull().default("claimed"),
  contributedCodeId: varchar("contributed_code_id").references(() => inviteCodes.id),
  note: text("note"),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inviteCodesRelations = relations(inviteCodes, ({ many }) => ({
  usages: many(codeUsages, { relationName: "code_usages" }),
  contributions: many(codeUsages, { relationName: "contributed_codes" }),
}));

export const codeUsagesRelations = relations(codeUsages, ({ one }) => ({
  inviteCode: one(inviteCodes, {
    fields: [codeUsages.inviteCodeId],
    references: [inviteCodes.id],
    relationName: "code_usages",
  }),
  contributedCode: one(inviteCodes, {
    fields: [codeUsages.contributedCodeId],
    references: [inviteCodes.id],
    relationName: "contributed_codes",
  }),
}));

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCodeUsageSchema = createInsertSchema(codeUsages).omit({
  id: true,
  claimedAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertCodeUsage = z.infer<typeof insertCodeUsageSchema>;
export type CodeUsage = typeof codeUsages.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
