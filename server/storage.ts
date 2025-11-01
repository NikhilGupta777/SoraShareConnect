import { type InviteCode, type InsertInviteCode, type Admin, type InsertAdmin } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAvailableCodesCount(): Promise<number>;
  getCodesByStatus(status: string): Promise<InviteCode[]>;
  getCodeById(id: string): Promise<InviteCode | undefined>;
  getCodeByValue(code: string): Promise<InviteCode | undefined>;
  getAllCodes(): Promise<InviteCode[]>;
  getNextAvailableCode(): Promise<InviteCode | undefined>;
  createCode(code: InsertInviteCode): Promise<InviteCode>;
  updateCodeStatus(id: string, status: string, dateDistributed?: Date, distributedCodeId?: string): Promise<InviteCode | undefined>;
  deleteCode(id: string): Promise<boolean>;
  getStatistics(): Promise<{ total: number; available: number; distributed: number; used: number; invalid: number }>;
  
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private codes: Map<string, InviteCode>;
  private admins: Map<string, Admin>;

  constructor() {
    this.codes = new Map();
    this.admins = new Map();
  }

  async getAvailableCodesCount(): Promise<number> {
    return Array.from(this.codes.values()).filter(code => code.status === 'available').length;
  }

  async getCodesByStatus(status: string): Promise<InviteCode[]> {
    return Array.from(this.codes.values()).filter(code => code.status === status);
  }

  async getCodeById(id: string): Promise<InviteCode | undefined> {
    return this.codes.get(id);
  }

  async getCodeByValue(code: string): Promise<InviteCode | undefined> {
    return Array.from(this.codes.values()).find(c => c.code === code);
  }

  async getAllCodes(): Promise<InviteCode[]> {
    return Array.from(this.codes.values()).sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  }

  async getNextAvailableCode(): Promise<InviteCode | undefined> {
    const availableCodes = await this.getCodesByStatus('available');
    return availableCodes[0];
  }

  async createCode(insertCode: InsertInviteCode): Promise<InviteCode> {
    const id = randomUUID();
    const code: InviteCode = {
      id,
      code: insertCode.code,
      status: insertCode.status || 'available',
      dateAdded: new Date(),
      dateDistributed: null,
      distributedCodeId: null,
    };
    this.codes.set(id, code);
    return code;
  }

  async updateCodeStatus(
    id: string, 
    status: string, 
    dateDistributed?: Date,
    distributedCodeId?: string
  ): Promise<InviteCode | undefined> {
    const code = this.codes.get(id);
    if (!code) return undefined;
    
    const validTransitions: Record<string, string[]> = {
      'available': ['distributed', 'invalid'],
      'distributed': ['used', 'invalid'],
      'used': ['invalid'],
      'invalid': [],
    };

    const currentStatus = code.status;
    if (currentStatus !== status && !validTransitions[currentStatus]?.includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }
    
    const updatedCode: InviteCode = {
      ...code,
      status,
      dateDistributed: dateDistributed || code.dateDistributed,
      distributedCodeId: distributedCodeId !== undefined ? distributedCodeId : code.distributedCodeId,
    };
    this.codes.set(id, updatedCode);
    return updatedCode;
  }

  async deleteCode(id: string): Promise<boolean> {
    return this.codes.delete(id);
  }

  async getStatistics(): Promise<{ total: number; available: number; distributed: number; used: number; invalid: number }> {
    const allCodes = Array.from(this.codes.values());
    return {
      total: allCodes.length,
      available: allCodes.filter(c => c.status === 'available').length,
      distributed: allCodes.filter(c => c.status === 'distributed').length,
      used: allCodes.filter(c => c.status === 'used').length,
      invalid: allCodes.filter(c => c.status === 'invalid').length,
    };
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const admin: Admin = { ...insertAdmin, id };
    this.admins.set(id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
