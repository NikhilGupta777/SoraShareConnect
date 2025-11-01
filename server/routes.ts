import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInviteCodeSchema, insertAdminSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";

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

  app.post("/api/codes/request", async (req, res) => {
    try {
      const { recaptchaToken } = req.body;
      
      if (!recaptchaToken) {
        return res.status(400).json({ error: "reCAPTCHA verification required" });
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

  app.post("/api/codes/submit", async (req, res) => {
    try {
      const { codes, distributedCodeId } = req.body;
      
      if (!Array.isArray(codes) || codes.length !== 4) {
        return res.status(400).json({ error: "Exactly 4 codes are required" });
      }

      const createdCodes = [];
      for (const codeText of codes) {
        if (!codeText || codeText.trim() === '') {
          return res.status(400).json({ error: "All code fields must be filled" });
        }
        
        const newCode = await storage.createCode({
          code: codeText.trim(),
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

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
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

  app.post("/api/admin/codes", requireAdmin, async (req, res) => {
    try {
      const { codes } = req.body;
      
      if (!Array.isArray(codes) || codes.length === 0) {
        return res.status(400).json({ error: "At least one code is required" });
      }

      const createdCodes = [];
      for (const codeText of codes) {
        if (codeText && codeText.trim() !== '') {
          const newCode = await storage.createCode({
            code: codeText.trim(),
            status: 'available',
          });
          createdCodes.push(newCode);
        }
      }

      res.json({ success: true, codes: createdCodes });
    } catch (error) {
      res.status(500).json({ error: "Failed to add codes" });
    }
  });

  app.patch("/api/admin/codes/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedCode = await storage.updateCodeStatus(id, status);
      if (!updatedCode) {
        return res.status(404).json({ error: "Code not found" });
      }

      res.json(updatedCode);
    } catch (error) {
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
