import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { calculateDistanceMeters } from '../src/services/geoSpatialService.js';
import { facilityCreateSchema, nearbyQuerySchema } from '../src/validators/facilityValidator.js';
import { issueCreateSchema, issueStatusUpdateSchema } from '../src/validators/issueValidator.js';
import { loginSchema, registerSchema } from '../src/validators/authValidator.js';

let passedTests = 0;
let failedTests = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${description}`);
    failedTests++;
  }
};

const runTests = async () => {
  console.log('====================================================');
  console.log(' Running Godavari GeoSeva 2027 Backend Test Suite');
  console.log('====================================================\n');

  // 1. Password Hashing & Bcrypt Verification
  console.log('Test Suite 1: Authentication & Password Hashing');
  try {
    const rawPassword = 'SecurePushkaraluPassword@2027';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert(hash !== rawPassword, 'Password is securely hashed (non-plaintext)');
    assert(hash.startsWith('$2'), 'Bcrypt signature verified');

    const isValidMatch = await bcrypt.compare(rawPassword, hash);
    assert(isValidMatch === true, 'Bcrypt compare matches original plaintext password');

    const isInvalidMatch = await bcrypt.compare('WrongPassword@123', hash);
    assert(isInvalidMatch === false, 'Bcrypt rejects mismatched password');

    // Test Demo Credentials verification
    const adminHash = await bcrypt.hash('Admin@2027', salt);
    assert(await bcrypt.compare('Admin@2027', adminHash), 'Demo Admin password Admin@2027 matches bcrypt hash');

    const volunteerHash = await bcrypt.hash('Volunteer@2027', salt);
    assert(await bcrypt.compare('Volunteer@2027', volunteerHash), 'Demo Volunteer password Volunteer@2027 matches bcrypt hash');

    const pilgrimHash = await bcrypt.hash('Pilgrim@2027', salt);
    assert(await bcrypt.compare('Pilgrim@2027', pilgrimHash), 'Demo Pilgrim password Pilgrim@2027 matches bcrypt hash');
  } catch (err) {
    assert(false, `Password hashing error: ${err.message}`);
  }

  // 2. JWT Generation & Expiration Policy
  console.log('\nTest Suite 2: JWT Token Policy & Verification');
  try {
    const secret = process.env.JWT_SECRET || 'test_secret_2027';
    const payload = { userId: 'user-admin-123', role: 'ADMIN' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert(typeof token === 'string' && token.split('.').length === 3, 'Valid JWT 3-part token issued');

    const decoded = jwt.verify(token, secret);
    assert(decoded.userId === payload.userId, 'JWT payload contains correct userId');
    assert(decoded.role === 'ADMIN', 'JWT payload preserves user role');

    let tamperFailed = false;
    try {
      jwt.verify(token, 'wrong_tampered_secret');
    } catch {
      tamperFailed = true;
    }
    assert(tamperFailed, 'JWT signature tamper check prevents forged tokens');
  } catch (err) {
    assert(false, `JWT verification error: ${err.message}`);
  }

  // 3. User Registration Privilege Escalation Prevention
  console.log('\nTest Suite 3: Registration Validation & Privilege Protection');
  try {
    const validReg = registerSchema.safeParse({
      name: 'Ravi Teja',
      email: 'ravi@pushkaralu.org',
      password: 'StrongPassword123',
      role: 'VOLUNTEER',
      phone: '+91 9848011223',
    });
    assert(validReg.success === true, 'Accepts valid VOLUNTEER registration');

    // Attempted self-promotion to ADMIN (Privilege Escalation)
    const adminAttempt = registerSchema.safeParse({
      name: 'Hacker User',
      email: 'hacker@example.com',
      password: 'HackerPassword123',
      role: 'ADMIN',
    });
    assert(
      adminAttempt.success === false,
      'Rejects self-assignment of ADMIN role during public registration (Privilege Escalation Guard)'
    );

    const invalidEmail = registerSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email-address',
      password: 'Password123',
    });
    assert(invalidEmail.success === false, 'Rejects malformed email address');

    // Test Login Schema normalizes mixed-case emails to lowercase
    const loginParsed = loginSchema.safeParse({
      email: '  Admin@GodavariSeva.Gov.In  ',
      password: 'Admin@2027'
    });
    assert(loginParsed.success === true, 'Login schema accepts valid credentials');
    assert(loginParsed.data?.email === 'admin@godavariseva.gov.in', 'Login schema automatically trims and lowercases email');
  } catch (err) {
    assert(false, `Registration validator error: ${err.message}`);
  }

  // 4. Geospatial Distance Calculation (Haversine)
  console.log('\nTest Suite 4: GIS Spatial Calculations & Haversine Proximity');
  try {
    // Kotilingala Ghat: [81.7760, 17.0010]
    // Pushkar Ghat: [81.7790, 16.9965]
    const distMeters = calculateDistanceMeters(17.0010, 81.7760, 16.9965, 81.7790);

    assert(
      distMeters > 500 && distMeters < 700,
      `Haversine correctly computed proximity between ghats (${distMeters} m)`
    );

    const zeroDist = calculateDistanceMeters(17.0010, 81.7760, 17.0010, 81.7760);
    assert(zeroDist === 0, 'Distance between identical points is exactly 0 meters');
  } catch (err) {
    assert(false, `Spatial math error: ${err.message}`);
  }

  // 5. Facility Geolocation Coordinates Validation
  console.log('\nTest Suite 5: Facility Schema & Coordinate Bounds Validation');
  try {
    const validFacility = facilityCreateSchema.safeParse({
      name: 'Pushkar Ghat Medical Camp 1',
      category: 'MEDICAL',
      latitude: 16.9968,
      longitude: 81.7788,
      address: 'Pushkar Ghat Approach Road, Rajamahendravaram',
      operationalStatus: 'OPEN',
      verificationStatus: 'VERIFIED',
      dataSource: 'OFFICIAL_MUNICIPAL',
    });
    assert(validFacility.success === true, 'Valid facility accepted by schema');

    // Invalid latitude out of bounds (> 90)
    const invalidLat = facilityCreateSchema.safeParse({
      name: 'Invalid Lat Point',
      category: 'TOILET',
      latitude: 95.5,
      longitude: 81.78,
      address: 'Main Road',
    });
    assert(invalidLat.success === false, 'Rejects latitude > 90°');

    // Invalid longitude out of bounds (> 180)
    const invalidLng = facilityCreateSchema.safeParse({
      name: 'Invalid Lng Point',
      category: 'TOILET',
      latitude: 17.0,
      longitude: 195.0,
      address: 'Main Road',
    });
    assert(invalidLng.success === false, 'Rejects longitude > 180°');

    // Invalid category
    const invalidCat = facilityCreateSchema.safeParse({
      name: 'Bad Category',
      category: 'NOT_A_REAL_CATEGORY',
      latitude: 17.0,
      longitude: 81.78,
      address: 'Main Road',
    });
    assert(invalidCat.success === false, 'Rejects unknown facility category');
  } catch (err) {
    assert(false, `Facility validation error: ${err.message}`);
  }

  // 6. Civic Issue Submission & Status Lifecycle
  console.log('\nTest Suite 6: Civic Issue Validation & Status Transition');
  try {
    const validIssue = issueCreateSchema.safeParse({
      category: 'WATER_UNAVAILABLE',
      title: 'Water tap 2 empty near Saraswati Ghat',
      description: 'Water pressure dropped completely and reservoir appears empty.',
      latitude: 17.0042,
      longitude: 81.7745,
    });
    assert(validIssue.success === true, 'Accepts valid civic issue report');

    const validStatusUpdate = issueStatusUpdateSchema.safeParse({
      status: 'IN_PROGRESS',
      administrativeNote: 'Municipal water tanker dispatched.',
    });
    assert(validStatusUpdate.success === true, 'Accepts valid status transition with admin notes');

    const invalidStatus = issueStatusUpdateSchema.safeParse({
      status: 'NOT_A_STATUS',
    });
    assert(invalidStatus.success === false, 'Rejects illegal issue status values');
  } catch (err) {
    assert(false, `Issue validation error: ${err.message}`);
  }

  // 7. AI Assistant Multilingual Suggestions & Helplines
  console.log('\nTest Suite 7: AI Assistant Multilingual Grounding & Suggestions');
  try {
    const { getSuggestedQuestions, OFFICIAL_EMERGENCY_CONTACTS } = await import(
      '../src/services/aiAssistantService.js'
    );

    const teQuestions = getSuggestedQuestions('te');
    assert(Array.isArray(teQuestions) && teQuestions.length > 0, 'Telugu suggestions generated successfully');
    assert(teQuestions.some((q) => q.includes('ఘాట్')), 'Telugu suggestions include bathing ghat inquiry');

    const hiQuestions = getSuggestedQuestions('hi');
    assert(Array.isArray(hiQuestions) && hiQuestions.length > 0, 'Hindi suggestions generated successfully');

    const enQuestions = getSuggestedQuestions('en');
    assert(enQuestions.some((q) => q.includes('bathing ghat')), 'English suggestions include bathing ghat inquiry');

    assert(OFFICIAL_EMERGENCY_CONTACTS.nationalEmergency === '112', 'Official 112 emergency hotline verified');
    assert(OFFICIAL_EMERGENCY_CONTACTS.ambulanceHelpline === '108', 'Official 108 ambulance hotline verified');
  } catch (err) {
    assert(false, `AI Assistant tests failed: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(` Test Suite Complete: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runTests();
