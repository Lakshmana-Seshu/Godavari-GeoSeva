import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Facility } from '../src/models/Facility.js';
import { CivicIssue } from '../src/models/CivicIssue.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { SAMPLE_FACILITIES, SAMPLE_ISSUES } from '../src/utils/seedData.js';

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/godavari_geoseva_2027';

  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('ERROR: Cannot run seed on production database without --force flag.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected.');

    // Clear existing collections safely
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Facility.deleteMany({}),
      CivicIssue.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('Creating system users with hashed passwords...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@2027', salt);
    const volunteerPasswordHash = await bcrypt.hash('Volunteer@2027', salt);
    const pilgrimPasswordHash = await bcrypt.hash('Pilgrim@2027', salt);

    const [adminUser, volunteerUser, pilgrimUser] = await User.create([
      {
        name: 'Srikar Varma (Administrator)',
        email: 'admin@godavariseva.gov.in',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        organization: 'Godavari Pushkaralu 2027 Organizing Authority',
        phone: '+91 883 2442000',
        accountStatus: 'ACTIVE'
      },
      {
        name: 'Bhavani Shankar (Field Volunteer)',
        email: 'volunteer@godavariseva.gov.in',
        passwordHash: volunteerPasswordHash,
        role: 'VOLUNTEER',
        organization: 'Pushkaralu Youth Seva Corps',
        phone: '+91 883 2442010',
        accountStatus: 'ACTIVE'
      },
      {
        name: 'Anjali Devi (Pilgrim)',
        email: 'pilgrim@example.com',
        passwordHash: pilgrimPasswordHash,
        role: 'PILGRIM',
        phone: '+91 9848099887',
        accountStatus: 'ACTIVE'
      }
    ]);

    console.log('Inserting sample facilities with GeoJSON coordinates...');
    const facilitiesWithUsers = SAMPLE_FACILITIES.map((f) => ({
      ...f,
      createdBy: adminUser._id,
      updatedBy: adminUser._id
    }));

    const createdFacilities = await Facility.insertMany(facilitiesWithUsers);
    console.log(`Successfully inserted ${createdFacilities.length} facilities.`);

    console.log('Ensuring 2dsphere indexes are built...');
    await Facility.collection.createIndex({ location: '2dsphere' });
    await CivicIssue.collection.createIndex({ location: '2dsphere' });

    console.log('Inserting sample civic issues...');
    const issuesWithUsers = SAMPLE_ISSUES.map((issue) => ({
      ...issue,
      submittedBy: pilgrimUser._id
    }));

    const createdIssues = await CivicIssue.insertMany(issuesWithUsers);
    console.log(`Successfully inserted ${createdIssues.length} civic issues.`);

    console.log('Recording audit log entry for database seeding...');
    await AuditLog.create({
      actor: adminUser._id,
      actorName: adminUser.name,
      actorRole: adminUser.role,
      action: 'SYSTEM_SEED',
      resourceType: 'System',
      resourceId: 'initial-seed',
      changeSummary: `Initialized database with ${createdFacilities.length} facilities, ${createdIssues.length} issues, and 3 baseline users.`
    });

    console.log('====================================================');
    console.log(' Database Seeding Completed Successfully!');
    console.log(' Demo Login Credentials:');
    console.log(' - Administrator: admin@godavariseva.gov.in / Admin@2027');
    console.log(' - Field Volunteer: volunteer@godavariseva.gov.in / Volunteer@2027');
    console.log(' - Pilgrim: pilgrim@example.com / Pilgrim@2027');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed script encountered an error:', error);
    process.exit(1);
  }
};

seedDatabase();
