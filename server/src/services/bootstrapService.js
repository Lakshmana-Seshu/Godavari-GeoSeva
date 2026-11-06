import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Facility } from '../models/Facility.js';
import { CivicIssue } from '../models/CivicIssue.js';
import { SAMPLE_FACILITIES, SAMPLE_ISSUES } from '../utils/seedData.js';

export const DEMO_ACCOUNTS = {
  admin: {
    name: 'Srikar Varma (Administrator)',
    email: 'admin@godavariseva.gov.in',
    password: 'Admin@2027',
    role: 'ADMIN',
    organization: 'Godavari Pushkaralu 2027 Organizing Authority',
    phone: '+91 883 2442000'
  },
  volunteer: {
    name: 'Bhavani Shankar (Field Volunteer)',
    email: 'volunteer@godavariseva.gov.in',
    password: 'Volunteer@2027',
    role: 'VOLUNTEER',
    organization: 'Pushkaralu Youth Seva Corps',
    phone: '+91 883 2442010'
  },
  pilgrim: {
    name: 'Anjali Devi (Pilgrim)',
    email: 'pilgrim@example.com',
    password: 'Pilgrim@2027',
    role: 'PILGRIM',
    phone: '+91 9848099887'
  }
};

/**
 * Ensures demo accounts and initial facility records exist.
 * Called automatically on MongoDB connection and upon login fallback.
 */
export const ensureBaselineData = async () => {
  try {
    const salt = await bcrypt.genSalt(10);

    // 1. Ensure Demo Admin
    let admin = await User.findOne({ email: DEMO_ACCOUNTS.admin.email });
    if (!admin) {
      const hash = await bcrypt.hash(DEMO_ACCOUNTS.admin.password, salt);
      admin = await User.create({
        ...DEMO_ACCOUNTS.admin,
        passwordHash: hash,
        accountStatus: 'ACTIVE'
      });
      console.log('[Bootstrap] Initialized default Administrator account: admin@godavariseva.gov.in');
    }

    // 2. Ensure Demo Volunteer
    let volunteer = await User.findOne({ email: DEMO_ACCOUNTS.volunteer.email });
    if (!volunteer) {
      const hash = await bcrypt.hash(DEMO_ACCOUNTS.volunteer.password, salt);
      volunteer = await User.create({
        ...DEMO_ACCOUNTS.volunteer,
        passwordHash: hash,
        accountStatus: 'ACTIVE'
      });
      console.log('[Bootstrap] Initialized default Field Volunteer account: volunteer@godavariseva.gov.in');
    }

    // 3. Ensure Demo Pilgrim
    let pilgrim = await User.findOne({ email: DEMO_ACCOUNTS.pilgrim.email });
    if (!pilgrim) {
      const hash = await bcrypt.hash(DEMO_ACCOUNTS.pilgrim.password, salt);
      pilgrim = await User.create({
        ...DEMO_ACCOUNTS.pilgrim,
        passwordHash: hash,
        accountStatus: 'ACTIVE'
      });
      console.log('[Bootstrap] Initialized default Pilgrim account: pilgrim@example.com');
    }

    // 4. Ensure Sample Facilities if empty
    const facilityCount = await Facility.countDocuments();
    if (facilityCount === 0 && admin) {
      console.log('[Bootstrap] Database has 0 facilities. Inserting Rajamahendravaram-Kovvur seed facilities...');
      const facilitiesWithUser = SAMPLE_FACILITIES.map((f) => ({
        ...f,
        createdBy: admin._id,
        updatedBy: admin._id
      }));
      await Facility.insertMany(facilitiesWithUser);
      console.log(`[Bootstrap] Successfully populated ${facilitiesWithUser.length} sample facilities.`);
    }

    // 5. Ensure Sample Civic Issues if empty
    const issueCount = await CivicIssue.countDocuments();
    if (issueCount === 0 && pilgrim) {
      console.log('[Bootstrap] Database has 0 civic issues. Inserting seed civic issues...');
      const issuesWithUser = SAMPLE_ISSUES.map((issue) => ({
        ...issue,
        submittedBy: pilgrim._id
      }));
      await CivicIssue.insertMany(issuesWithUser);
      console.log(`[Bootstrap] Successfully populated ${issuesWithUser.length} sample civic issues.`);
    }

    // 6. Ensure 2dsphere indexes
    try {
      await Facility.collection.createIndex({ location: '2dsphere' });
      await CivicIssue.collection.createIndex({ location: '2dsphere' });
    } catch (idxErr) {
      // Index might already exist, safe to ignore
    }
  } catch (error) {
    console.error('[Bootstrap] Warning: Could not complete baseline data initialization:', error.message);
  }
};

/**
 * Validates and self-heals canonical demo credentials if a hash mismatch occurs.
 */
export const verifyOrHealDemoCredentials = async (email, candidatePassword) => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const demoEntry = Object.values(DEMO_ACCOUNTS).find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (!demoEntry) {
    return null; // Not a canonical demo account
  }

  if (candidatePassword !== demoEntry.password) {
    return null; // Password doesn't match canonical demo password
  }

  // The user provided the exact canonical demo password for this demo email.
  // Check if account exists; if not, create it.
  let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(demoEntry.password, salt);

  if (!user) {
    user = await User.create({
      ...demoEntry,
      passwordHash: newHash,
      accountStatus: 'ACTIVE'
    });
    console.log(`[Bootstrap] Auto-created demo user ${normalizedEmail} on demand.`);
  } else {
    // Self-heal the password hash in case it was stored incorrectly or corrupted
    user.passwordHash = newHash;
    user.accountStatus = 'ACTIVE';
    await user.save();
    console.log(`[Bootstrap] Successfully synchronized demo credentials hash for ${normalizedEmail}.`);
  }

  return user;
};

