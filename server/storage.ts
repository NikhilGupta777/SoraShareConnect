import { type InviteCode, type InsertInviteCode, type Admin, type InsertAdmin, type CodeUsage, type InsertCodeUsage, inviteCodes, codeUsages, admins } from "@shared/schema";
import { db } from "./db";
import { eq, sql, and, desc, count } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getAvailableCodesCount(): Promise<number>;
  getCodesByStatus(status: string): Promise<InviteCode[]>;
  getCodeById(id: string): Promise<InviteCode | undefined>;
  getCodeByValue(code: string): Promise<InviteCode | undefined>;
  getAllCodes(): Promise<InviteCode[]>;
  getNextAvailableCode(): Promise<InviteCode | undefined>;
  claimCode(ipAddress: string, userAgent: string): Promise<{ code: InviteCode; usage: CodeUsage } | null>;
  createCode(code: InsertInviteCode): Promise<InviteCode>;
  createCodes(codes: InsertInviteCode[]): Promise<InviteCode[]>;
  updateCodeStatus(id: string, status: string): Promise<InviteCode | undefined>;
  deleteCode(id: string): Promise<boolean>;
  getStatistics(): Promise<{ 
    total: number; 
    available: number; 
    active: number; 
    exhausted: number; 
    invalid: number;
    totalClaims: number;
  }>;
  getCodeUsages(codeId: string): Promise<CodeUsage[]>;
  contributeCode(code: string, claimerIpHash: string): Promise<InviteCode>;
  
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  private hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip + process.env.SESSION_SECRET).digest('hex');
  }

  async getAvailableCodesCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(inviteCodes)
      .where(
        and(
          eq(inviteCodes.status, 'available'),
          sql`${inviteCodes.usageCount} < ${inviteCodes.maxUses}`
        )
      );
    return result[0]?.count || 0;
  }

  async getCodesByStatus(status: string): Promise<InviteCode[]> {
    return await db.select().from(inviteCodes).where(eq(inviteCodes.status, status));
  }

  async getCodeById(id: string): Promise<InviteCode | undefined> {
    const [code] = await db.select().from(inviteCodes).where(eq(inviteCodes.id, id));
    return code;
  }

  async getCodeByValue(code: string): Promise<InviteCode | undefined> {
    const [inviteCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.code, code));
    return inviteCode;
  }

  async getAllCodes(): Promise<InviteCode[]> {
    return await db.select().from(inviteCodes).orderBy(desc(inviteCodes.createdAt));
  }

  async getNextAvailableCode(): Promise<InviteCode | undefined> {
    const [code] = await db
      .select()
      .from(inviteCodes)
      .where(
        and(
          eq(inviteCodes.status, 'available'),
          sql`${inviteCodes.usageCount} < ${inviteCodes.maxUses}`
        )
      )
      .orderBy(inviteCodes.createdAt)
      .limit(1);
    return code;
  }

  async claimCode(ipAddress: string, userAgent: string): Promise<{ code: InviteCode; usage: CodeUsage } | null> {
    const ipHash = this.hashIp(ipAddress);
    
    return await db.transaction(async (tx) => {
      const [availableCode] = await tx
        .select()
        .from(inviteCodes)
        .where(
          and(
            eq(inviteCodes.status, 'available'),
            sql`${inviteCodes.usageCount} < ${inviteCodes.maxUses}`
          )
        )
        .orderBy(inviteCodes.createdAt)
        .limit(1)
        .for('update');

      if (!availableCode) {
        return null;
      }

      const newUsageCount = availableCode.usageCount + 1;
      const newStatus = newUsageCount >= availableCode.maxUses ? 'exhausted' : 
                       newUsageCount > 0 ? 'active' : 'available';

      const [updatedCode] = await tx
        .update(inviteCodes)
        .set({
          usageCount: newUsageCount,
          status: newStatus,
          lastClaimedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(inviteCodes.id, availableCode.id))
        .returning();

      const [usage] = await tx
        .insert(codeUsages)
        .values({
          inviteCodeId: availableCode.id,
          ipHash,
          userAgent,
          status: 'claimed',
        })
        .returning();

      return { code: updatedCode, usage };
    });
  }

  async createCode(insertCode: InsertInviteCode): Promise<InviteCode> {
    const [code] = await db
      .insert(inviteCodes)
      .values({
        ...insertCode,
        usageCount: 0,
        maxUses: insertCode.maxUses || 6,
        status: insertCode.status || 'available',
      })
      .returning();
    return code;
  }

  async createCodes(codes: InsertInviteCode[]): Promise<InviteCode[]> {
    if (codes.length === 0) return [];
    
    return await db
      .insert(inviteCodes)
      .values(codes.map(code => ({
        ...code,
        usageCount: 0,
        maxUses: code.maxUses || 6,
        status: code.status || 'available',
      })))
      .returning();
  }

  async updateCodeStatus(id: string, status: string): Promise<InviteCode | undefined> {
    const [code] = await db
      .update(inviteCodes)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(inviteCodes.id, id))
      .returning();
    return code;
  }

  async deleteCode(id: string): Promise<boolean> {
    const result = await db.delete(inviteCodes).where(eq(inviteCodes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getStatistics(): Promise<{ 
    total: number; 
    available: number; 
    active: number; 
    exhausted: number; 
    invalid: number;
    totalClaims: number;
  }> {
    const codes = await db.select().from(inviteCodes);
    const [claimsResult] = await db.select({ count: count() }).from(codeUsages);
    
    return {
      total: codes.length,
      available: codes.filter(c => c.status === 'available' && c.usageCount < c.maxUses).length,
      active: codes.filter(c => c.status === 'active').length,
      exhausted: codes.filter(c => c.status === 'exhausted').length,
      invalid: codes.filter(c => c.status === 'invalid').length,
      totalClaims: claimsResult?.count || 0,
    };
  }

  async getCodeUsages(codeId: string): Promise<CodeUsage[]> {
    return await db
      .select()
      .from(codeUsages)
      .where(eq(codeUsages.inviteCodeId, codeId))
      .orderBy(desc(codeUsages.claimedAt));
  }

  async contributeCode(code: string, claimerIpHash: string): Promise<InviteCode> {
    const existing = await this.getCodeByValue(code);
    if (existing) {
      throw new Error('Code already exists');
    }

    return await db.transaction(async (tx) => {
      const [newCode] = await tx
        .insert(inviteCodes)
        .values({
          code,
          status: 'available',
          usageCount: 0,
          maxUses: 6,
        })
        .returning();

      const claimer = await tx
        .select()
        .from(codeUsages)
        .where(eq(codeUsages.ipHash, claimerIpHash))
        .orderBy(desc(codeUsages.claimedAt))
        .limit(1);

      if (claimer.length > 0) {
        await tx
          .update(codeUsages)
          .set({
            status: 'confirmed',
            contributedCodeId: newCode.id,
          })
          .where(eq(codeUsages.id, claimer[0].id));
      }

      return newCode;
    });
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }
}

export const storage = new DatabaseStorage();
