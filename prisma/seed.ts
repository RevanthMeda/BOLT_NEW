import { PrismaClient } from '.prisma/client';
import bcrypt from 'bcryptjs';

// Define enums manually if not exported by Prisma
enum UserRole {
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
  TECHNICAL_MANAGER = 'TECHNICAL_MANAGER',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
}

enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

enum ReportStatus {
  DRAFT = 'DRAFT',
  FINAL = 'FINAL',
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('Test123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      password: hashedPassword,
    },
  });

  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@test.com' },
    update: {},
    create: {
      email: 'engineer@test.com',
      fullName: 'John Engineer',
      role: UserRole.ENGINEER,
      status: UserStatus.ACTIVE,
      password: hashedPassword,
    },
  });

  const tm = await prisma.user.upsert({
    where: { email: 'tm@test.com' },
    update: {},
    create: {
      email: 'tm@test.com',
      fullName: 'Technical Manager',
      role: UserRole.TECHNICAL_MANAGER,
      status: UserStatus.ACTIVE,
      password: hashedPassword,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@test.com' },
    update: {},
    create: {
      email: 'pm@test.com',
      fullName: 'Project Manager',
      role: UserRole.PROJECT_MANAGER,
      status: UserStatus.ACTIVE,
      password: hashedPassword,
    },
  });

  // Create a sample SAT report
  const sampleReport = await prisma.report.create({
    data: {
      title: 'Sample SAT Report - Control System Validation',
      projectRef: 'PRJ-2025-001',
      documentRef: 'SAT-001',
      revision: '1.0',
      status: ReportStatus.DRAFT,
      creatorId: engineer.id,
      tmId: tm.id,
      pmId: pm.id,
    },
  });

  // Add some sample report steps
  await prisma.reportStep.createMany({
    data: [
      {
        reportId: sampleReport.id,
        stepName: 'document_info',
        data: {
          title: 'Sample SAT Report - Control System Validation',
          projectRef: 'PRJ-2025-001',
          documentRef: 'SAT-001',
          revision: '1.0',
          date: '2025-01-27',
          preparedBy: 'John Engineer',
        },
      },
      {
        reportId: sampleReport.id,
        stepName: 'introduction_scope',
        data: {
          introduction: '<p>This Site Acceptance Test document outlines the comprehensive testing procedures for the industrial control system implementation.</p>',
          scope: '<p>The scope includes validation of all digital and analog I/O modules, SCADA interfaces, and alarm systems.</p>',
          relatedDocuments: [
            { name: 'System Design Document', reference: 'SDD-001' },
            { name: 'I/O List', reference: 'IOL-001' },
          ],
        },
      },
    ],
  });

  // System settings
  await prisma.systemSetting.upsert({
    where: { key: 'final_storage_locations' },
    update: {},
    create: {
      key: 'final_storage_locations',
      value: [
        '/storage/completed/project-a',
        '/storage/completed/project-b',
        '/storage/archive/2025',
      ],
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'company_info' },
    update: {},
    create: {
      key: 'company_info',
      value: {
        name: 'Cully Engineering',
        logo: '/logo/company-logo.png',
        primaryColor: '#3B82F6',
      },
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('Demo users created:');
  console.log('- admin@test.com / Test123! (Admin)');
  console.log('- engineer@test.com / Test123! (Engineer)');
  console.log('- tm@test.com / Test123! (Technical Manager)');
  console.log('- pm@test.com / Test123! (Project Manager)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });