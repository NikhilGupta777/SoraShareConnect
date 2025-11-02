import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInviteCodeSchema, insertAdminSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";
import rateLimit from "express-rate-limit";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many code requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const contributeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many code contributions from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "sora-invite-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.get("/api/codes/stats", async (_req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  app.get("/api/codes/check/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const inviteCode = await storage.getCodeByValue(code);
      
      if (!inviteCode) {
        return res.status(404).json({ error: "Code not found" });
      }

      const usages = await storage.getCodeUsages(inviteCode.id);
      
      res.json({
        code: inviteCode.code,
        status: inviteCode.status,
        usageCount: inviteCode.usageCount,
        maxUses: inviteCode.maxUses,
        remainingUses: inviteCode.maxUses - inviteCode.usageCount,
        usages: usages.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check code" });
    }
  });

  app.post("/api/codes/request", requestLimiter, async (req, res) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      const result = await storage.claimCode(ipAddress, userAgent);
      
      if (!result) {
        return res.status(404).json({ 
          error: "No codes available at this time. Please check back later." 
        });
      }

      const { code, usage } = result;
      
      res.json({ 
        code: code.code, 
        codeId: code.id,
        usageId: usage.id,
        remainingUses: code.maxUses - code.usageCount,
        status: code.status,
      });
    } catch (error) {
      console.error("Error requesting code:", error);
      res.status(500).json({ error: "Failed to request code" });
    }
  });

  const submitCodeSchema = z.object({
    code: z.string().min(1, "Code is required"),
  });

  app.post("/api/codes/contribute", contributeLimiter, async (req, res) => {
    try {
      const validation = submitCodeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: validation.error.errors[0]?.message || "Invalid code" 
        });
      }

      const { code } = validation.data;
      const trimmedCode = code.trim();

      if (!trimmedCode) {
        return res.status(400).json({ error: "Code cannot be empty" });
      }

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const ipHash = require('crypto').createHash('sha256')
        .update(ipAddress + (process.env.SESSION_SECRET || ''))
        .digest('hex');

      const newCode = await storage.contributeCode(trimmedCode, ipHash);

      res.json({ 
        success: true, 
        message: "Thank you for contributing!",
        code: newCode,
      });
    } catch (error: any) {
      if (error.message === 'Code already exists') {
        return res.status(400).json({ 
          error: "This code already exists in the system" 
        });
      }
      console.error("Error contributing code:", error);
      res.status(500).json({ error: "Failed to submit code" });
    }
  });

  const feedbackSchema = z.object({
    usageId: z.string(),
    working: z.boolean(),
  });

  app.post("/api/codes/feedback", async (req, res) => {
    try {
      const validation = feedbackSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid feedback data" });
      }

      const { usageId, working } = validation.data;
      const result = await storage.submitCodeFeedback(usageId, working);

      if (result.success && result.newCode && result.newUsage) {
        res.json({ 
          success: true, 
          message: working ? "Thanks for the feedback!" : "We've given you a new code!",
          replaced: !working,
          newCode: {
            code: result.newCode.code,
            codeId: result.newCode.id,
            usageId: result.newUsage.id,
            remainingUses: result.newCode.maxUses - result.newCode.usageCount,
          }
        });
      } else if (result.success) {
        res.json({ 
          success: true, 
          message: "Thanks for the feedback!",
          replaced: false,
        });
      } else {
        res.status(404).json({ 
          error: "Sorry, no replacement codes available right now." 
        });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  const markUsedSchema = z.object({
    usageId: z.string(),
  });

  app.post("/api/codes/mark-used", async (req, res) => {
    try {
      const validation = markUsedSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const { usageId } = validation.data;
      const usage = await storage.markCodeAsUsedByUser(usageId);

      if (!usage) {
        return res.status(404).json({ error: "Usage not found" });
      }

      res.json({ success: true, message: "Marked as used!" });
    } catch (error) {
      console.error("Error marking code as used:", error);
      res.status(500).json({ error: "Failed to mark code as used" });
    }
  });

  const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const { username, password } = validation.data;
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ authenticated: !!req.session.adminId });
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  app.get("/api/admin/codes", requireAdmin, async (_req, res) => {
    try {
      const codes = await storage.getAllCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch codes" });
    }
  });

  app.get("/api/admin/codes/:id/usages", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const usages = await storage.getCodeUsages(id);
      res.json(usages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch code usages" });
    }
  });

  const addCodesSchema = z.object({
    codes: z.array(z.string().min(1)),
  });

  app.post("/api/admin/codes", requireAdmin, async (req, res) => {
    try {
      const validation = addCodesSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "At least one valid code is required" });
      }

      const { codes } = validation.data;
      const trimmedCodes = codes.map(c => c.trim()).filter(c => c !== '');

      if (trimmedCodes.length === 0) {
        return res.status(400).json({ error: "At least one valid code is required" });
      }

      for (const codeText of trimmedCodes) {
        const existing = await storage.getCodeByValue(codeText);
        if (existing) {
          return res.status(400).json({ 
            error: `Code ${codeText} already exists in the system` 
          });
        }
      }

      const createdCodes = await storage.createCodes(
        trimmedCodes.map(code => ({
          code,
          status: 'available' as const,
        }))
      );

      res.json({ success: true, codes: createdCodes });
    } catch (error) {
      res.status(500).json({ error: "Failed to add codes" });
    }
  });

  const updateCodeSchema = z.object({
    status: z.enum(['available', 'active', 'exhausted', 'invalid']),
  });

  app.patch("/api/admin/codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validation = updateCodeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const { status } = validation.data;
      
      const code = await storage.getCodeById(id);
      if (!code) {
        return res.status(404).json({ error: "Code not found" });
      }

      const updatedCode = await storage.updateCodeStatus(id, status);
      if (!updatedCode) {
        return res.status(404).json({ error: "Code not found" });
      }

      res.json(updatedCode);
    } catch (error: any) {
      console.error("Error updating code:", error);
      res.status(500).json({ error: "Failed to update code" });
    }
  });

  app.delete("/api/admin/codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCode(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Code not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete code" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
