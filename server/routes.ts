import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInviteCodeSchema, insertAdminSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
  }
}

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

  async function verifyRecaptcha(token: string): Promise<boolean> {
    try {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        console.warn("RECAPTCHA_SECRET_KEY not set, skipping verification in development");
        return true;
      }

      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("reCAPTCHA verification error:", error);
      return false;
    }
  }

  const requestCodeSchema = z.object({
    recaptchaToken: z.string().min(1),
  });

  app.post("/api/codes/request", async (req, res) => {
    try {
      const validation = requestCodeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "reCAPTCHA verification required" });
      }

      const { recaptchaToken } = validation.data;

      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return res.status(400).json({ error: "reCAPTCHA verification failed. Please try again." });
      }

      const code = await storage.getNextAvailableCode();
      if (!code) {
        return res.status(404).json({ error: "No codes available at this time. Please check back later." });
      }

      await storage.updateCodeStatus(code.id, 'distributed', new Date());
      
      res.json({ code: code.code, codeId: code.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to request code" });
    }
  });

  const submitCodesSchema = z.object({
    codes: z.array(z.string().min(1)).length(4),
    distributedCodeId: z.string().optional(),
  });

  app.post("/api/codes/submit", async (req, res) => {
    try {
      const validation = submitCodesSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Exactly 4 valid codes are required" });
      }

      const { codes, distributedCodeId } = validation.data;

      const trimmedCodes = codes.map(c => c.trim());
      const uniqueCodes = new Set(trimmedCodes);
      if (uniqueCodes.size !== trimmedCodes.length) {
        return res.status(400).json({ error: "Duplicate codes are not allowed" });
      }

      for (const codeText of trimmedCodes) {
        const existing = await storage.getCodeByValue(codeText);
        if (existing) {
          return res.status(400).json({ error: `Code ${codeText} already exists in the system` });
        }
      }

      const createdCodes = [];
      for (const codeText of trimmedCodes) {
        const newCode = await storage.createCode({
          code: codeText,
          status: 'available',
        });
        createdCodes.push(newCode);
      }

      if (distributedCodeId) {
        await storage.updateCodeStatus(distributedCodeId, 'used');
      }

      res.json({ success: true, message: "Thank you for contributing!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit codes" });
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
          return res.status(400).json({ error: `Code ${codeText} already exists in the system` });
        }
      }

      const createdCodes = [];
      for (const codeText of trimmedCodes) {
        const newCode = await storage.createCode({
          code: codeText,
          status: 'available',
        });
        createdCodes.push(newCode);
      }

      res.json({ success: true, codes: createdCodes });
    } catch (error) {
      res.status(500).json({ error: "Failed to add codes" });
    }
  });

  const updateCodeSchema = z.object({
    status: z.enum(['available', 'distributed', 'used', 'invalid']),
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

      const dateDistributed = status === 'distributed' && code.status !== 'distributed' 
        ? new Date() 
        : undefined;
      
      const updatedCode = await storage.updateCodeStatus(id, status, dateDistributed);
      if (!updatedCode) {
        return res.status(404).json({ error: "Code not found" });
      }

      res.json(updatedCode);
    } catch (error: any) {
      if (error.message && error.message.includes("Invalid status transition")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update code" });
      }
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
