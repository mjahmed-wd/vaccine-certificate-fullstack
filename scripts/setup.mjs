import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setup() {
  try {
    // Hash password with bcrypt
    const password = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        fatherName: "Admin Father",
        motherName: "Admin Mother",
        username: "admin",
        role: "ADMIN",
        center: "Main Center",
        phone: "01700000000",
        phoneNumber: "01700000001",
        permanentAddress: "123 Admin Street, City",
        passwordHash: hashedPassword,
      },
    });

    // Create Technician User
    await prisma.user.create({
      data: {
        firstName: "Tech",
        lastName: "User",
        fatherName: "Tech Father",
        motherName: "Tech Mother",
        username: "tech",
        role: "TECHNICIAN",
        center: "Branch Center",
        phone: "01700000002",
        phoneNumber: "01700000003",
        permanentAddress: "456 Tech Street, City",
        passwordHash: hashedPassword,
      },
    });

    // Create Vaccines with Providers
    const vaccine1 = await prisma.vaccine.create({
      data: {
        name: "COVID-19 Vaccine",
        totalDose: 2,
        providers: {
          create: [
            { name: "Pfizer" },
            { name: "Moderna" },
            { name: "AstraZeneca" },
          ],
        },
      },
    });

    await prisma.vaccine.create({
      data: {
        name: "Flu Vaccine",
        totalDose: 1,
        providers: {
          create: [{ name: "GSK" }, { name: "Sanofi" }],
        },
      },
    });

    // Create Sample Certificates
    await prisma.certificate.create({
      data: {
        nidNumber: "1234567890",
        nationality: "Bangladeshi",
        patientName: "John Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "MALE",
        vaccineId: vaccine1.id,
        doseNumber: 1,
        dateAdministered: new Date(),
        vaccinations: {
          create: {
            vaccineId: vaccine1.id,
            vaccineName: vaccine1.name,
            doseNumber: 1,
            dateAdministered: new Date(),
            vaccinationCenter: "Main Center",
            vaccinatedById: admin.id,
            vaccinatedByName: `${admin.firstName} ${admin.lastName}`,
          },
        },
      },
    });

    console.log("Setup completed successfully!");
    console.log("Admin credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\nTechnician credentials:");
    console.log("Username: tech");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setup(); 