import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

async function main() {
    // Clear existing data
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`
    await prisma.$executeRaw`TRUNCATE TABLE BoosterDose;`
    await prisma.$executeRaw`TRUNCATE TABLE VaccinationRecord;`
    await prisma.$executeRaw`TRUNCATE TABLE Certificate;`
    await prisma.$executeRaw`TRUNCATE TABLE VaccineProvider;`
    await prisma.$executeRaw`TRUNCATE TABLE Vaccine;`
    await prisma.$executeRaw`TRUNCATE TABLE User;`
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`

    // Create admin user
    const adminUser = await prisma.user.create({
        data: {
            firstName: 'Admin',
            lastName: 'User',
            username: 'admin',
            passwordHash: await hashPassword('admin123'),
            role: 'ADMIN',
            center: 'Main Center',
            phone: '1234567890'
        }
    })

    // Create technician user
    await prisma.user.create({
        data: {
            firstName: 'Tech',
            lastName: 'User',
            username: 'tech',
            passwordHash: await hashPassword('tech123'),
            role: 'TECHNICIAN',
            center: 'Branch Center',
            phone: '0987654321'
        }
    })

    // Create vaccines
    const covidVaccine = await prisma.vaccine.create({
        data: {
            name: 'COVID-19 Vaccine',
            totalDose: 2,
            providers: {
                create: [
                    { name: 'Pfizer' },
                    { name: 'Moderna' }
                ]
            }
        }
    })

    await prisma.vaccine.create({
        data: {
            name: 'Influenza Vaccine',
            totalDose: 1,
            providers: {
                create: [
                    { name: 'GSK' },
                    { name: 'Sanofi' }
                ]
            }
        }
    })

    // Create a sample certificate with vaccination record and booster
    await prisma.certificate.create({
        data: {
            nidNumber: '1234567890',
            nationality: 'Bangladesh',
            patientName: 'John Doe',
            fatherName: 'James Doe',
            motherName: 'Jane Doe',
            permanentAddress: '123 Main St, Dhaka',
            phoneNumber: '01712345678',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'MALE',
            vaccineId: covidVaccine.id,
            doseNumber: 2,
            dateAdministered: new Date('2023-01-01'),
            vaccinations: {
                create: [
                    {
                        vaccineId: covidVaccine.id,
                        vaccineName: 'COVID-19 Vaccine',
                        doseNumber: 1,
                        dateAdministered: new Date('2023-01-01'),
                        vaccinationCenter: 'Main Center',
                        vaccinatedById: adminUser.id,
                        vaccinatedByName: 'Admin User',
                        providerId: (await prisma.vaccineProvider.findFirst({ where: { name: 'Pfizer' } })).id
                    },
                    {
                        vaccineId: covidVaccine.id,
                        vaccineName: 'COVID-19 Vaccine',
                        doseNumber: 2,
                        dateAdministered: new Date('2023-02-01'),
                        vaccinationCenter: 'Main Center',
                        vaccinatedById: adminUser.id,
                        vaccinatedByName: 'Admin User',
                        providerId: (await prisma.vaccineProvider.findFirst({ where: { name: 'Pfizer' } })).id
                    }
                ]
            },
            boosterDoses: {
                create: [
                    {
                        vaccineId: covidVaccine.id,
                        dateAdministered: new Date('2023-06-01'),
                        vaccinationCenter: 'Main Center',
                        vaccinatedById: adminUser.id,
                        vaccinatedByName: 'Admin User',
                        providerId: (await prisma.vaccineProvider.findFirst({ where: { name: 'Moderna' } })).id
                    }
                ]
            }
        }
    })

    console.log('Database has been seeded!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

