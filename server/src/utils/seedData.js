export const SAMPLE_FACILITIES = [
  {
    name: 'Pushkar Ghat Central (Demonstration Record)',
    category: 'GHAT',
    description:
      'Major river bathing ghat with dedicated safety barricades, stepped stone access, and life-jacket stations. Synthetic test record for Pushkaralu 2027.',
    location: {
      type: 'Point',
      coordinates: [81.7770, 17.0028] // [lng, lat]
    },
    address: 'Pushkar Ghat Promenade, Riverbank Road, Rajamahendravaram',
    landmark: 'Near Godavari Arch Bridge Viewpoint',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Ramp slope access at Gate 2 with dedicated wheelchairs'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Operational 24/7 with round-the-clock SDRF lifeguards'
    },
    contactInformation: {
      phone: '+91 883 2442001',
      inChargeName: 'Sri K. Venkat Rao (Ghat Superintendent)',
      emergencyHelpline: '108 / 112'
    },
    capacity: {
      estimatedCapacity: 25000,
      unit: 'pilgrims/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Municipal Corporation Demonstration Survey (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Kotilingala Temple Ghat (Demonstration Record)',
    category: 'GHAT',
    description:
      'Historic northern bathing ghat with deep waters. River safety nets and illumination towers deployed. Synthetic test record for Pushkaralu 2027.',
    location: {
      type: 'Point',
      coordinates: [81.7820, 17.0145]
    },
    address: 'Kotilingala Revu, Northern Bank, Rajamahendravaram',
    landmark: 'Opposite Sri Kotilingeswara Swamy Devalayam',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: false,
      rampAvailable: false,
      elderlyAssistance: true,
      notes: 'Stone steps only; volunteer physical assistance available'
    },
    openingHours: {
      is24Hours: false,
      openTime: '04:00',
      closeTime: '22:00',
      notes: 'Night bathing restricted after 22:00 for safety'
    },
    contactInformation: {
      phone: '+91 883 2442005',
      inChargeName: 'P. Satyanarayana',
      emergencyHelpline: '108'
    },
    capacity: {
      estimatedCapacity: 15000,
      unit: 'pilgrims/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Field Volunteer Demonstration Report (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Saraswati Ghat (Demonstration Record)',
    category: 'GHAT',
    description:
      'Southern bathing ghat equipped with baby-feeding cubicles and changing rooms for women. Synthetic test record for Pushkaralu 2027.',
    location: {
      type: 'Point',
      coordinates: [81.7745, 17.0005]
    },
    address: 'Saraswati Ghat Road, Rajamahendravaram',
    landmark: 'Adjacent to Godavari Bund Road Park',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Full ramp access along with separate queue for senior citizens'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Open round-the-clock'
    },
    contactInformation: {
      phone: '+91 883 2442008',
      inChargeName: 'M. Lakshmi Devi',
      emergencyHelpline: '112'
    },
    capacity: {
      estimatedCapacity: 12000,
      unit: 'pilgrims/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'District Administration Audit (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Goshpada Kshetram Ghat - Kovvur (Demonstration Record)',
    category: 'GHAT',
    description:
      'Primary western-bank bathing ghat in Kovvur town across the river. Synthetic test record for Pushkaralu 2027.',
    location: {
      type: 'Point',
      coordinates: [81.7280, 17.0120]
    },
    address: 'Goshpada Ghat Approach Road, Kovvur',
    landmark: 'Near Kovvur Rail-cum-Road Bridge Junction',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Wheelchair access available via Kovvur south gate'
    },
    openingHours: {
      is24Hours: true,
      notes: '24 hours open during festival dates'
    },
    contactInformation: {
      phone: '+91 8813 231102',
      inChargeName: 'B. Krishna Murthy',
      emergencyHelpline: '108'
    },
    capacity: {
      estimatedCapacity: 18000,
      unit: 'pilgrims/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Kovvur Municipality Demonstration Survey (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Pushkar Ghat Bio-Toilets Cluster A (Demonstration Record)',
    category: 'TOILET',
    description:
      'High-capacity 40-seat automated bio-toilet complex with dedicated male, female, and accessible cubicles. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7765, 17.0032]
    },
    address: 'Outer Concourse, Gate 3, Pushkar Ghat, Rajamahendravaram',
    landmark: 'Near Central Clock Tower',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      notes: '2 dedicated wide cubicles for persons with disabilities'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Continuous sanitation cycling'
    },
    contactInformation: {
      phone: '+91 883 2442015',
      inChargeName: 'Sanitation Officer Ramesh',
      emergencyHelpline: '112'
    },
    capacity: {
      estimatedCapacity: 40,
      unit: 'cubicles'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Swachh Andhra Sanitation Audit (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Kotilingala Mobile Toilets Complex (Demonstration Record)',
    category: 'TOILET',
    description:
      '20-unit trailer-mounted mobile sanitation unit. Synthetic test record for Pushkaralu 2027.',
    location: {
      type: 'Point',
      coordinates: [81.7812, 17.0138]
    },
    address: 'Temple Parking Lot 2, Kotilingala, Rajamahendravaram',
    landmark: 'Beside APSRTC Temporary Bus Stop',
    operationalStatus: 'TEMPORARILY_UNAVAILABLE',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: false,
      rampAvailable: false,
      notes: 'Steps required'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Undergoing emergency water pump repair'
    },
    contactInformation: {
      phone: '+91 883 2442022',
      inChargeName: 'Supervisor D. Prasad',
      emergencyHelpline: '108'
    },
    capacity: {
      estimatedCapacity: 20,
      unit: 'cubicles'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Field Volunteer Verification (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Pushkar Ghat RO Drinking Water Kiosk #1 (Demonstration Record)',
    category: 'DRINKING_WATER',
    description:
      'Continuous chilled Reverse Osmosis (RO) purified drinking water dispensing station with 12 stainless steel taps. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7775, 17.0025]
    },
    address: 'Promenade Entry Gate 1, Pushkar Ghat, Rajamahendravaram',
    landmark: 'Behind Information Pavilion',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      notes: 'Lower-height taps fitted for children and wheelchair users'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Constant water filtration'
    },
    contactInformation: {
      phone: '+91 883 2442030',
      inChargeName: 'Water Works Engineer Sudhakar',
      emergencyHelpline: '112'
    },
    capacity: {
      estimatedCapacity: 5000,
      unit: 'liters/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Public Health Department (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Saraswati Ghat Water Distribution Point (Demonstration Record)',
    category: 'DRINKING_WATER',
    description:
      'Packaged water bottle distribution and refill counter managed by volunteer scouts. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7750, 17.0012]
    },
    address: 'Saraswati Ghat Exit Pathway, Rajamahendravaram',
    landmark: 'Near First Aid Tent',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      notes: 'Paved ground level counter'
    },
    openingHours: {
      is24Hours: false,
      openTime: '05:00',
      closeTime: '23:00'
    },
    contactInformation: {
      phone: '+91 883 2442033',
      inChargeName: 'Volunteer Coordinator Anand'
    },
    capacity: {
      estimatedCapacity: 3000,
      unit: 'liters/hour'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'District Administration (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Central Riverfront 24x7 Medical Camp (Demonstration Record)',
    category: 'MEDICAL',
    description:
      'Fully equipped 20-bed emergency triage facility with doctors, cardiac monitors, oxygen supplies, and 2 stationed ALS ambulances. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7780, 17.0040]
    },
    address: 'Main Bund Road, Between Pushkar & Markandeya Ghats, Rajamahendravaram',
    landmark: 'Adjacent to Municipal Police Control Post',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Hospital-standard ramps and stretchers'
    },
    openingHours: {
      is24Hours: true,
      notes: '24/7 round-the-clock emergency doctors'
    },
    contactInformation: {
      phone: '+91 883 2442108',
      inChargeName: 'Dr. S. R. Chary, MD (Chief Medical Officer)',
      emergencyHelpline: '108'
    },
    capacity: {
      estimatedCapacity: 20,
      unit: 'emergency beds'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'DMHO East Godavari (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Kotilingala First Aid & ORS Booth (Demonstration Record)',
    category: 'MEDICAL',
    description:
      'First-aid outpost for heat stroke, minor cuts, blood pressure checks, and oral rehydration salt distribution. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7830, 17.0150]
    },
    address: 'Kotilingala Main Entry Arch, Rajamahendravaram',
    landmark: 'Beside Police Assistance Booth',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      notes: 'Ground level first-aid tent'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Operates throughout event dates'
    },
    contactInformation: {
      phone: '+91 883 2442109',
      inChargeName: 'Sister Mary (Duty Nurse)',
      emergencyHelpline: '108'
    },
    capacity: {
      estimatedCapacity: 4,
      unit: 'triage beds'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Red Cross Demonstration Unit (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Pilgrim Transit Shelter & Rest Hall 1 (Demonstration Record)',
    category: 'SHELTER',
    description:
      'Waterproof German hangar canopy with seating for 3,000 pilgrims, industrial fans, mobile charging points, and public announcement system. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7730, 16.9980]
    },
    address: 'Old Municipal Grounds, Godavari Bund, Rajamahendravaram',
    landmark: 'Near Railway Station Approach',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Level asphalt floor with designated elderly resting enclave'
    },
    openingHours: {
      is24Hours: true,
      notes: 'Open 24/7 during Pushkaralu'
    },
    contactInformation: {
      phone: '+91 883 2442080',
      inChargeName: 'Revenue Officer Nageswara Rao',
      emergencyHelpline: '112'
    },
    capacity: {
      estimatedCapacity: 3000,
      unit: 'persons'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'Revenue Department (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Kovvur Riverfront Pilgrim Shed (Demonstration Record)',
    category: 'SHELTER',
    description:
      'Temporary shade shelter with drinking water access and carpeted rest area. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7295, 17.0135]
    },
    address: 'Near Kovvur Ghat Concourse, Kovvur',
    landmark: 'Adjacent to Kovvur Temple Office',
    operationalStatus: 'OPEN',
    verificationStatus: 'PENDING_VERIFICATION',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true
    },
    openingHours: {
      is24Hours: true
    },
    contactInformation: {
      phone: '+91 8813 231140',
      inChargeName: 'Volunteer Lead Srinivas'
    },
    capacity: {
      estimatedCapacity: 1500,
      unit: 'persons'
    },
    lastVerifiedAt: null,
    dataSource: 'Field Volunteer Report (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'NDRF & SDRF River Rescue Command Post (Demonstration Record)',
    category: 'EMERGENCY',
    description:
      'Disaster response headquarters equipped with 8 inflatable motorized rescue boats, deep divers, sonar gear, and life buoy launchers. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7758, 17.0019]
    },
    address: 'River Police Jetty, Godavari Bund, Rajamahendravaram',
    landmark: 'Adjacent to Pushkar Ghat southern edge',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: false,
      notes: 'Tactical command operations zone'
    },
    openingHours: {
      is24Hours: true,
      notes: '24/7 water surveillance radar and watch tower'
    },
    contactInformation: {
      phone: '+91 883 2442100',
      inChargeName: 'Inspector Rajesh Kumar (10th Bn NDRF)',
      emergencyHelpline: '112 / 1077 (District Control)'
    },
    capacity: {
      estimatedCapacity: 100,
      unit: 'rescue personnel'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'National Disaster Response Force (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Fire & Rescue Station - Pushkar Post (Demonstration Record)',
    category: 'EMERGENCY',
    description:
      'Stationed high-pressure fire tenders, hydraulic cutters, and rapid emergency intervention squad. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7795, 17.0055]
    },
    address: 'Main Bund Crossing, Rajamahendravaram',
    landmark: 'Near River View Hotel Junction',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true
    },
    openingHours: {
      is24Hours: true
    },
    contactInformation: {
      phone: '+91 883 2442101',
      inChargeName: 'Station Fire Officer B. Mohan Rao',
      emergencyHelpline: '101 / 112'
    },
    capacity: {
      estimatedCapacity: 4,
      unit: 'fire engines'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'AP Fire Services (Synthetic Data)',
    isSyntheticDemo: true
  },
  {
    name: 'Pedestrian Holding Area & Queue Barricade (Demonstration Record)',
    category: 'ROAD_ACCESS',
    description:
      'Organized zigzag crowd holding barricade with mist-cooling system, overhead shade mesh, and safe dispersal routes. Synthetic test record.',
    location: {
      type: 'Point',
      coordinates: [81.7752, 16.9995]
    },
    address: 'South Bund Entrance Corridor, Rajamahendravaram',
    landmark: 'Leading to Saraswati & Pushkar Ghats',
    operationalStatus: 'OPEN',
    verificationStatus: 'VERIFIED',
    accessibility: {
      wheelchairAccessible: true,
      rampAvailable: true,
      elderlyAssistance: true,
      notes: 'Designated priority lane for elderly pilgrims and families with infants'
    },
    openingHours: {
      is24Hours: true
    },
    contactInformation: {
      phone: '+91 883 2442050',
      inChargeName: 'Traffic Inspector Murthy',
      emergencyHelpline: '100 / 112'
    },
    capacity: {
      estimatedCapacity: 10000,
      unit: 'pilgrims in queue'
    },
    lastVerifiedAt: new Date(),
    dataSource: 'District Police Traffic Wing (Synthetic Data)',
    isSyntheticDemo: true
  }
];

export const SAMPLE_ISSUES = [
  {
    referenceCode: 'ISSUE-2027-1042',
    title: 'Water pump tripping at Kotilingala Mobile Bio-Toilets',
    description:
      'Motor pump has failed causing water outage in mobile toilets cluster 2. Sanitation volunteers are using backup manual drums. Requires municipal electrical contractor.',
    category: 'WATER_UNAVAILABLE',
    location: {
      type: 'Point',
      coordinates: [81.7812, 17.0138]
    },
    address: 'Temple Parking Lot 2, Kotilingala, Rajamahendravaram',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    reporterContact: {
      name: 'Ramu Volunteer',
      phone: '9848011223'
    },
    attachments: [],
    administrativeNotes: [
      {
        authorName: 'Admin Control Room',
        note: 'Electrical wing dispatched with 5HP replacement motor. Expected restoration by 17:00.',
        timestamp: new Date()
      }
    ],
    statusHistory: [
      {
        status: 'SUBMITTED',
        changedByName: 'Ramu Volunteer',
        comment: 'Reported by field volunteer during 10:00 AM sanitation inspection',
        timestamp: new Date(Date.now() - 3600000 * 4)
      },
      {
        status: 'UNDER_REVIEW',
        changedByName: 'Pushkaralu Monitoring Officer',
        comment: 'Triage team assigned priority HIGH',
        timestamp: new Date(Date.now() - 3600000 * 3)
      },
      {
        status: 'IN_PROGRESS',
        changedByName: 'Pushkaralu Monitoring Officer',
        comment: 'Municipal maintenance technician on site',
        timestamp: new Date(Date.now() - 3600000 * 1)
      }
    ]
  },
  {
    referenceCode: 'ISSUE-2027-2089',
    title: 'Ramp railing loose at Gate 2 Saraswati Ghat',
    description:
      'The left support handrail of the disabled accessibility ramp has come loose near the lower landing. Potential hazard for elderly pilgrims.',
    category: 'DAMAGED_INFRASTRUCTURE',
    location: {
      type: 'Point',
      coordinates: [81.7745, 17.0005]
    },
    address: 'Saraswati Ghat Gate 2 Ramp, Rajamahendravaram',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    reporterContact: {
      name: 'Suresh Pilgrim',
      phone: '9989045612'
    },
    attachments: [],
    administrativeNotes: [],
    statusHistory: [
      {
        status: 'SUBMITTED',
        changedByName: 'Suresh Pilgrim',
        comment: 'Reported via mobile GeoSeva web app',
        timestamp: new Date(Date.now() - 3600000 * 2)
      },
      {
        status: 'UNDER_REVIEW',
        changedByName: 'Admin Officer',
        comment: 'Field engineer notified to inspect welded support',
        timestamp: new Date(Date.now() - 3600000 * 1)
      }
    ]
  },
  {
    referenceCode: 'ISSUE-2027-3105',
    title: 'Blocked pedestrian route near Old Railway Gate',
    description:
      'Unscheduled food distribution stall causing bottleneck in designated pedestrian dispersal lane. Needs police crowd marshal intervention.',
    category: 'BLOCKED_PEDESTRIAN_ROUTE',
    location: {
      type: 'Point',
      coordinates: [81.7735, 16.9985]
    },
    address: 'Railway Bund Crossing, Rajamahendravaram',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    reporterContact: {
      name: 'Traffic Marshal K. Rao',
      phone: '9440112345'
    },
    attachments: [],
    administrativeNotes: [
      {
        authorName: 'Admin Control Room',
        note: 'Marshal relocated stall to designated Annadhanam shed. Passage cleared.',
        timestamp: new Date()
      }
    ],
    statusHistory: [
      {
        status: 'SUBMITTED',
        changedByName: 'Traffic Marshal K. Rao',
        comment: 'Reported via portal',
        timestamp: new Date(Date.now() - 3600000 * 12)
      },
      {
        status: 'RESOLVED',
        changedByName: 'Pushkaralu Monitoring Officer',
        comment: 'Passage cleared and tested for crowd flow',
        timestamp: new Date(Date.now() - 3600000 * 6)
      }
    ]
  }
];
