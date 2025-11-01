import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inviteCodes = pgTable("invite_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("available"),
  dateAdded: timestamp("date_added").notNull().defaultNow(),
  dateDistributed: timestamp("date_distributed"),
  distributedCodeId: varchar("distributed_code_id"),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).omit({
  id: true,
  dateAdded: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
