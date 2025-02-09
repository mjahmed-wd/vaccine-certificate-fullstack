import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function verifyUser() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: "admin",
      },
    });

    if (!user) {
      console.log("Admin user not found!");
      return;
    }

    console.log("Admin user found:");
    console.log("Username:", user.username);
    console.log("Role:", user.role);
    
    // Test password
    const testPassword = "admin123";
    const passwordMatch = await bcrypt.compare(testPassword, user.passwordHash);
    console.log("Password 'admin123' matches:", passwordMatch);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUser(); 