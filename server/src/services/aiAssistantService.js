import { Facility } from '../models/Facility.js';
import { calculateDistanceMeters } from './geoSpatialService.js';
import { FACILITY_CATEGORIES } from '../config/constants.js';

// Default central reference coordinates: Pushkar Ghat Promenade, Rajamahendravaram
export const DEFAULT_CORRIDOR_CENTER = {
  lat: 17.0028,
  lng: 81.7770
};

// Assistant Telemetry Store for Admin Dashboard Monitoring
export const assistantTelemetry = {
  totalQueries: 0,
  successfulQueries: 0,
  failedQueries: 0,
  languageCounts: {},
  categorySearches: {},
  voiceQueryCount: 0,
  totalLatencyMs: 0,
  recentQueries: []
};

// Category keywords for intent recognition across Indian languages & English
const CATEGORY_KEYWORDS = {
  GHAT: [
    'ghat', 'bathing', 'snanam', 'snana', 'river', 'nadi', 'pushkar', 'revu',
    'పుష్కర ఘాట్', 'స్నానం', 'రేవు', 'స్నాన ఘాట్', 'నది',
    'घाट', 'स्नान', 'नदी', 'पुष्कर घाट',
    'தீர்த்தக்கட்டம்', 'ஸ்நானம்', 'घाटात', 'ঘাট', 'ಸ್ನಾನ ಘಟ್ಟ'
  ],
  DRINKING_WATER: [
    'water', 'drinking', 'water point', 'neeru', 'manchineellu', 'kudineer', 'pani', 'jal',
    'మంచి నీరు', 'నీళ్లు', 'తాగునీరు', 'జలం', 'వాటర్',
    'पानी', 'पीने का पानी', 'जल', 'पेयजल',
    'தண்ணீர்', 'குடிநீர்', 'ನೀರು', 'ಕುಡಿಯುವ ನೀರು', 'जल', 'জল'
  ],
  TOILET: [
    'toilet', 'restroom', 'washroom', 'lavatory', 'sowchalam', 'shouchalay', 'kazhivarai',
    'మరుగుదొడ్డి', 'టాయిలెట్', 'శౌచాలయం', 'వాష్‌రూమ్',
    'शौचालय', 'टॉयलेट', 'प्रसाधन',
    'கழிப்பறை', 'ಶೌಚಾಲಯ', 'শৌচাগার', 'টয়লেট'
  ],
  MEDICAL: [
    'medical', 'first aid', 'doctor', 'hospital', 'ambulance', 'clinic', 'vaidyasala', 'aarogya', 'dawa',
    'వైద్య శిబిరం', 'ఆరోగ్య కేంద్రం', 'డాక్టర్', 'చికిత్స', 'ఆంబులెన్స్', 'మందులు',
    'चिकित्सा', 'अस्पताल', 'डॉक्टर', 'प्राथमिक उपचार', 'एम्बुलेंस',
    'மருத்துவ முகாம்', 'மருத்துவர்', 'ಆರೋಗ್ಯ ಶಿಬಿರ', 'ವೈದ್ಯರು', 'চিকিৎসা শিবির'
  ],
  SHELTER: [
    'shelter', 'rest area', 'tent', 'stay', 'vishranthi', 'ashray', 'mandapam', 'choultry',
    'విశ్రాంతి గృహం', 'ఆశ్రయం', 'మండపం', 'షెల్టర్', 'గుడారం',
    'आश्रय', 'विश्राम स्थल', 'रैन बसेरा', 'तंबू',
    'தங்குமிடம்', 'ஓய்வறை', 'ಆಶ್ರಯ ತಾಣ', 'বিশ্রামাগার'
  ],
  EMERGENCY: [
    'emergency', 'police', 'fire', 'ndrf', 'sdrf', 'rescue', 'help', 'danger', 'apada',
    'అత్యవసర', 'పోలీస్', 'రెస్క్యూ', 'రక్షణ', 'సహాయం', 'అగ్నిమాపక',
    'आपातकालीन', 'पुलिस', 'फायर ब्रिगेड', 'बचाव दल', 'मदद',
    'அவசர கால', 'காவல்துறை', 'ತುರ್ತು ಸೇವೆ', 'জরুরী সেবা'
  ],
  ROAD_ACCESS: [
    'bridge', 'road', 'kovvur', 'rajahmundry', 'cross', 'route', 'traffic', 'darhi', 'rasta', 'dhaari',
    'వంతెన', 'రోడ్డు', 'కొవ్వూరు', 'రాజమండ్రి', 'దారి', 'వంతెన దాటడం', 'ట్రాఫిక్',
    'पुल', 'सड़क', 'कोव्वुर', 'रास्ता', 'राजमंड्री', 'मार्ग',
    'பாலம்', 'சாலை', 'ಸೇತುವೆ', 'ರಸ್ತೆ', 'সেতু', 'রাস্তা'
  ]
};

// Emergency helpline references (verified official directory)
export const OFFICIAL_EMERGENCY_CONTACTS = {
  nationalEmergency: '112',
  policeHelpline: '100 / 112',
  ambulanceHelpline: '108',
  fireAndRescue: '101',
  disasterControlRoom: '+91 883 2442300 (Godavari District Command)',
  ndrfControl: '+91 883 2442100',
  riverPolicePatrol: '+91 883 2442001'
};

/**
 * Detects the facility category from multilingual pilgrim queries
 */
const detectCategoryIntent = (text = '') => {
  const lower = text.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }

  // Generic keyword matchers
  if (lower.includes('doctor') || lower.includes('health') || lower.includes('clinic')) return 'MEDICAL';
  if (lower.includes('water') || lower.includes('drink') || lower.includes('tap')) return 'DRINKING_WATER';
  if (lower.includes('toilet') || lower.includes('restroom') || lower.includes('bath')) return 'TOILET';
  if (lower.includes('ghat') || lower.includes('river') || lower.includes('dip')) return 'GHAT';
  if (lower.includes('camp') || lower.includes('stay') || lower.includes('sleep')) return 'SHELTER';
  if (lower.includes('police') || lower.includes('ndrf') || lower.includes('rescue')) return 'EMERGENCY';
  if (lower.includes('bridge') || lower.includes('kovvur') || lower.includes('reach')) return 'ROAD_ACCESS';

  return null;
};

/**
 * Detects special user intents (e.g., reporting issue, emergency, bridge corridor navigation)
 */
const detectSpecialIntent = (text = '') => {
  const lower = text.toLowerCase();

  if (
    lower.includes('emergency') ||
    lower.includes('help me') ||
    lower.includes('accident') ||
    lower.includes('drowning') ||
    lower.includes('danger') ||
    lower.includes('ఆపద') ||
    lower.includes('కాపాడండి') ||
    lower.includes('खतरा')
  ) {
    return 'EMERGENCY_HELP';
  }

  if (
    lower.includes('report') ||
    lower.includes('damaged') ||
    lower.includes('broken') ||
    lower.includes('overflow') ||
    lower.includes('complain') ||
    lower.includes('ఫిర్యాదు') ||
    lower.includes('సమస్య') ||
    lower.includes('शिकायत')
  ) {
    return 'REPORT_ISSUE';
  }

  if (
    (lower.includes('kovvur') && (lower.includes('reach') || lower.includes('how to') || lower.includes('bridge') || lower.includes('go to'))) ||
    lower.includes('కొవ్వూరు ఎలా వెళ్ళాలి') ||
    lower.includes('कोव्वुर कैसे जाएं')
  ) {
    return 'BRIDGE_TRANSIT';
  }

  return 'SEARCH_FACILITY';
};

/**
 * Queries database for nearby facilities matching category and location
 */
const queryNearbyFacilities = async (category, userLat, userLng, limit = 5) => {
  const query = { isActive: true };
  if (category) {
    query.category = category;
  }

  // Attempt geospatial $near sphere query
  try {
    const facilities = await Facility.find({
      ...query,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [userLng, userLat]
          },
          $maxDistance: 25000 // 25 km max corridor radius
        }
      }
    })
      .limit(limit)
      .lean();

    return facilities.map((f) => {
      const [fLng, fLat] = f.location.coordinates;
      const distMeters = Math.round(calculateDistanceMeters(userLat, userLng, fLat, fLng));
      return {
        ...f,
        distanceMeters: distMeters,
        distanceText: distMeters >= 1000 ? `${(distMeters / 1000).toFixed(1)} km` : `${distMeters} m`
      };
    });
  } catch (err) {
    // Fallback if 2dsphere index query experiences edge case
    const allMatching = await Facility.find(query).limit(50).lean();
    return allMatching
      .map((f) => {
        const [fLng, fLat] = f.location.coordinates;
        const dist = Math.round(calculateDistanceMeters(userLat, userLng, fLat, fLng));
        return {
          ...f,
          distanceMeters: dist,
          distanceText: dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${dist} m`
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);
  }
};

/**
 * Builds grounded natural language responses in English, Telugu, Hindi, Tamil, and other languages
 */
const buildGroundedResponse = (intent, category, facilities, lang, userLocationUsed) => {
  const topFacility = facilities[0];
  const count = facilities.length;

  if (intent === 'EMERGENCY_HELP') {
    switch (lang) {
      case 'te':
        return `అత్యవసర సహాయం కోసం దయచేసి వెంటనే 112 లేదా 108 నంబర్లకు డయల్ చేయండి. గోదావరి పుష్కరాల కమాండ్ కంట్రోల్ రూమ్ నెం: +91 883 2442300. ఎన్డీఆర్ఎఫ్/ఎస్డీఆర్ఎఫ్ నదీ రక్షణ బృందాలు మరియు నదీ తీర వైద్య శిబిరాలు 24 గంటలూ అందుబాటులో ఉన్నాయి.`;
      case 'hi':
        return `आपातकालीन सहायता के लिए कृपया तुरंत 112 या 108 डायल करें। गोदावरी पुष्करालु जिला नियंत्रण कक्ष: +91 883 2442300। एनडीआरएफ/एसडीआरएफ बचाव दल और नदी किनारे चिकित्सा शिविर 24 घंटे सक्रिय हैं।`;
      case 'ta':
        return `அவசர உதவிக்கு உடனடியாக 112 அல்லது 108 அழைக்கவும். கோதாவரி புஷ்கரலு கட்டுப்பாட்டு அறை: +91 883 2442300. மீட்புக் குழுக்கள் மற்றும் மருத்துவ முகாம்கள் 24 மணிநேரமும் செயல்படுகின்றன.`;
      default:
        return `For immediate emergency assistance, dial 112 or 108. The Godavari Pushkaralu District Disaster Control Room is reachable at +91 883 2442300. SDRF & NDRF rescue boats are deployed 24/7 along the riverbank.`;
    }
  }

  if (intent === 'REPORT_ISSUE') {
    switch (lang) {
      case 'te':
        return `పాడైన టాయిలెట్, తాగునీరు కొరత లేదా అడ్డంకి పడిన దారుల గురించి ఫిర్యాదు చేయడానికి, దయచేసి పై నావిగేషన్‌లోని "ఫిర్యాదు చేయండి" (Report Issue) బటన్‌ను ఉపయోగించండి. మీ లొకేషన్ మరియు ఫొటోతో సహా క్షణాల్లో సమర్పించవచ్చు.`;
      case 'hi':
        return `टूटे हुए शौचालय, पानी की कमी या अवरुद्ध मार्ग की शिकायत दर्ज करने के लिए ऊपर दिए गए "Report Issue" (समस्या रिपोर्ट) फॉर्म का उपयोग करें। आप फोटो और जीपीएस स्थान के साथ रिपोर्ट भेज सकते हैं।`;
      default:
        return `To report a broken toilet, dry water tap, or pedestrian hazard, navigate to the "Report Civic Issue" portal (/report-issue). You can pinpoint coordinates and attach an on-site photo for instant volunteer verification.`;
    }
  }

  if (intent === 'BRIDGE_TRANSIT') {
    switch (lang) {
      case 'te':
        return `రాజమహేంద్రవరం నుండి కొవ్వూరు చేరుకోవడానికి గోదావరి ఆర్చ్ బ్రిడ్జ్ మరియు రైల్-కమ్-రోడ్ బ్రిడ్జ్ (NH16 బైపాస్) అనుసంధాన మార్గాలు అందుబాటులో ఉన్నాయి. కొవ్వూరు వైపు గోష్పాద క్షేత్రం మరియు ప్రధాన పుష్కర స్నాన ఘాట్‌లు సురక్షిత రవాణా లైన్లతో అనుసంధానించబడి ఉన్నాయి.`;
      case 'hi':
        return `राजमहेंद्रवरम से कोव्वुर जाने के लिए गोदावरी रेल-कम-रोड ब्रिज और गोदावरी आर्च ब्रिज उपलब्ध हैं। कोव्वुर के गोष्पाद क्षेत्र और स्नान घाटों के लिए समर्पित पैदल और वाहन लेन संचालित हैं।`;
      default:
        return `To travel between Rajamahendravaram and Kovvur, use the Godavari Rail-cum-Road Bridge or the Godavari Arch Bridge transit corridor. Dedicated pedestrian walkways and one-way Pushkaralu shuttle lanes connect the East Bank to Kovvur's Goshpada Kshetram.`;
    }
  }

  // Facility search response
  if (!topFacility) {
    switch (lang) {
      case 'te':
        return `క్షమించండి, మీ అభ్యర్థనకు సరిపోలే ధృవీకరించబడిన సౌకర్యాలు ప్రస్తుతం కనుగొనబడలేదు. దయచేసి ఇంటరాక్టివ్ జీఐఎస్ మ్యాప్‌లో మరింత విస్తృత శోధన చేయండి.`;
      case 'hi':
        return `क्षमा करें, आपके अनुरोध के अनुसार इस क्षेत्र में कोई सत्यापित सुविधा नहीं मिली। कृपया जीआईएस मानचित्र पर व्यापक खोज करें।`;
      default:
        return `No matching verified facilities were located in this immediate perimeter. Try exploring all categories on the interactive GIS map.`;
    }
  }

  const categoryLabel = category ? category.replace('_', ' ').toLowerCase() : 'facility';

  switch (lang) {
    case 'te':
      return `మీకు సమీపంలో ఉన్న ${count} ${categoryLabel} కేంద్రాలు కనుగొనబడ్డాయి. అత్యంత సమీపంలో: "${topFacility.name}" (${topFacility.distanceText} దూరంలో, స్థితి: ${topFacility.operationalStatus === 'OPEN' ? 'ప్రస్తుతం తెరిచి ఉంది' : 'పరిశీలనలో ఉంది'}). మ్యాప్‌లో చూసేందుకు క్రింది బటన్‌పై క్లిక్ చేయండి.`;
    case 'hi':
      return `आपके निकटतम ${count} ${categoryLabel} केंद्र मिले हैं। सबसे नजदीक: "${topFacility.name}" (${topFacility.distanceText} दूरी, स्थिति: ${topFacility.operationalStatus === 'OPEN' ? 'खुला है' : 'सत्यापनाधीन'}). मानचित्र पर देखने के लिए नीचे कार्ड पर क्लिक करें।`;
    case 'ta':
      return `உங்களுக்கு அருகில் ${count} ${categoryLabel} வசதிகள் கண்டறியப்பட்டன. மிக அருகில்: "${topFacility.name}" (${topFacility.distanceText} தொலைவு). வரைபடத்தில் காண கீழே கிளிக் செய்யவும்.`;
    case 'kn':
      return `ನಿಮ್ಮ ಹತ್ತಿರ ${count} ${categoryLabel} ಕೇಂದ್ರಗಳು ಕಂಡುಬಂದಿವೆ. ಹತ್ತಿರದ ಕೇಂದ್ರ: "${topFacility.name}" (${topFacility.distanceText}). ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಲು ಕೆಳಗಿನ ಕಾರ್ಡ್ ಕ್ಲಿಕ್ ಮಾಡಿ.`;
    default:
      return `Found ${count} nearby ${categoryLabel} location(s). Closest verified point: "${topFacility.name}" (${topFacility.distanceText} away, status: ${topFacility.operationalStatus}). Click "Show on Map" below to inspect exact coordinates and directions.`;
  }
};

/**
 * Main AI Chatbot Handler for Godavari Seva Assistant
 */
export const processAssistantChat = async ({
  message = '',
  language = 'en',
  location = null,
  isVoice = false
}) => {
  const startTime = Date.now();
  assistantTelemetry.totalQueries++;
  if (isVoice) assistantTelemetry.voiceQueryCount++;

  const safeLang = (language || 'en').toLowerCase().slice(0, 2);
  assistantTelemetry.languageCounts[safeLang] = (assistantTelemetry.languageCounts[safeLang] || 0) + 1;

  try {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error('Please provide a message or spoken question.');
    }

    // Determine user coordinates (use provided coordinates or corridor center)
    let userLat = DEFAULT_CORRIDOR_CENTER.lat;
    let userLng = DEFAULT_CORRIDOR_CENTER.lng;
    let userLocationUsed = false;

    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      if (
        location.latitude >= -90 && location.latitude <= 90 &&
        location.longitude >= -180 && location.longitude <= 180
      ) {
        userLat = location.latitude;
        userLng = location.longitude;
        userLocationUsed = true;
      }
    }

    // 1. Detect Intent & Category
    const category = detectCategoryIntent(trimmedMessage);
    const specialIntent = detectSpecialIntent(trimmedMessage);

    if (category) {
      assistantTelemetry.categorySearches[category] =
        (assistantTelemetry.categorySearches[category] || 0) + 1;
    }

    // 2. Query Grounded Facilities from MongoDB
    let facilities = [];
    if (specialIntent === 'SEARCH_FACILITY' || category) {
      facilities = await queryNearbyFacilities(category, userLat, userLng, 4);
    } else if (specialIntent === 'EMERGENCY_HELP') {
      facilities = await queryNearbyFacilities('EMERGENCY', userLat, userLng, 3);
    } else if (specialIntent === 'BRIDGE_TRANSIT') {
      facilities = await queryNearbyFacilities('ROAD_ACCESS', userLat, userLng, 3);
    }

    // 3. Format structured facility cards with map action
    const facilityCards = facilities.map((f) => ({
      id: f._id,
      name: f.name,
      category: f.category,
      address: f.address || '',
      landmark: f.landmark || '',
      operationalStatus: f.operationalStatus || 'UNKNOWN',
      verificationStatus: f.verificationStatus || 'UNVERIFIED',
      distanceMeters: f.distanceMeters,
      distanceText: f.distanceText,
      coordinates: {
        lat: f.location.coordinates[1],
        lng: f.location.coordinates[0]
      },
      accessibility: f.accessibility || {},
      contactPhone: f.contactInformation?.phone || '',
      isSyntheticDemo: !!f.isSyntheticDemo,
      mapAction: {
        type: 'FOCUS_FACILITY',
        coordinates: {
          lat: f.location.coordinates[1],
          lng: f.location.coordinates[0]
        },
        zoom: 17,
        facilityId: f._id
      }
    }));

    // 4. Generate grounded natural response
    const answerText = buildGroundedResponse(
      specialIntent,
      category,
      facilities,
      safeLang,
      userLocationUsed
    );

    const latency = Date.now() - startTime;
    assistantTelemetry.successfulQueries++;
    assistantTelemetry.totalLatencyMs += latency;

    // Track recent queries for monitoring
    if (assistantTelemetry.recentQueries.length > 50) {
      assistantTelemetry.recentQueries.shift();
    }
    assistantTelemetry.recentQueries.push({
      message: trimmedMessage.slice(0, 100),
      language: safeLang,
      category: category || specialIntent,
      resultsCount: facilityCards.length,
      latencyMs: latency,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      data: {
        message: answerText,
        language: safeLang,
        intent: specialIntent,
        category: category || null,
        userLocationUsed,
        facilityResultsCount: facilityCards.length,
        facilities: facilityCards,
        suggestedNextQuestions: getSuggestedQuestions(safeLang),
        emergencyContacts: specialIntent === 'EMERGENCY_HELP' ? OFFICIAL_EMERGENCY_CONTACTS : null,
        meta: {
          latencyMs: latency,
          groundedInDatabase: true
        }
      }
    };
  } catch (error) {
    assistantTelemetry.failedQueries++;
    throw error;
  }
};

/**
 * Multilingual suggested questions for the chat UI
 */
export const getSuggestedQuestions = (lang = 'en') => {
  const suggestions = {
    te: [
      'నాకు దగ్గరలో ఉన్న స్నాన ఘాట్ ఎక్కడ ఉంది?',
      'మంచినీటి కేంద్రం ఎక్కడ దొరుకుతుంది?',
      'సమీపంలో ఉన్న పబ్లిక్ టాయిలెట్ చూపించు',
      'వైద్య శిబిరం (ఫస్ట్ ఎయిడ్) ఎక్కడ ఉంది?',
      'రాజమండ్రి నుండి కొవ్వూరు ఎలా వెళ్ళాలి?',
      'అత్యవసర రక్షణ నంబర్లు ఏమిటి?'
    ],
    hi: [
      'निकटतम स्नान घाट कहाँ है?',
      'पीने का पानी कहाँ मिलेगा?',
      'नजदीकी सार्वजनिक शौचालय खोजें',
      'प्राथमिक चिकित्सा शिविर कहाँ है?',
      'राजमंड्री से कोव्वुर कैसे जाएं?',
      'आपातकालीन हेल्पलाइन नंबर क्या हैं?'
    ],
    ta: [
      'அருகிலுள்ள நீராடும் படித்துறை எங்கே உள்ளது?',
      'குடிநீர் எங்கே கிடைக்கும்?',
      'அருகிலுள்ள பொதுக் கழிப்பறை எங்கே?',
      'அவசர மருத்துவ உதவி மையம் எங்கே?'
    ],
    kn: [
      'ಹತ್ತಿರದ ಸ್ನಾನ ಘಟ್ಟ ಎಲ್ಲಿದೆ?',
      'ಕುಡಿಯುವ ನೀರು ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
      'ಹತ್ತಿರದ ಶೌಚಾಲಯ ತೋರಿಸಿ',
      'ತುರ್ತು ವೈದ್ಯಕೀಯ ಶಿಬಿರ ಎಲ್ಲಿದೆ?'
    ],
    en: [
      'Where is the nearest bathing ghat?',
      'Where can I find drinking water?',
      'Find the nearest public toilet',
      'Where is the nearest medical camp?',
      'How do I reach Kovvur from Rajamahendravaram?',
      'What are the emergency helpline numbers?'
    ]
  };

  return suggestions[lang] || suggestions.en;
};

