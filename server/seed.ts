import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingCodes = await storage.getAllCodes();
  
  if (existingCodes.length === 0) {
    console.log("Seeding database with initial codes...");
    
    const initialCodes = [
      "SORA-DEMO-001",
      "SORA-DEMO-002",
      "SORA-DEMO-003",
      "SORA-DEMO-004",
    ];

    for (const code of initialCodes) {
      await storage.createCode({
        code,
        status: "available",
      });
    }

    console.log(`Added ${initialCodes.length} initial codes`);
  }

  const existingAdmin = await storage.getAdminByUsername("admin");
  
  if (!existingAdmin) {
    console.log("Creating default admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await storage.createAdmin({
      username: "admin",
      password: hashedPassword,
    });

    console.log("Default admin created (username: admin, password: admin123)");
    console.log("IMPORTANT: Change the default password in production!");
  }
}
