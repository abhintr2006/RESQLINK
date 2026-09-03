import { EmergencyCategory, GeoCoordinate, Hospital, Responder } from '../types';
import { BENGALURU_HOSPITALS, INITIAL_RESPONDERS } from '../data/bengaluruData';
import { calculateHaversineDistanceMeters } from './locationLockService';

export interface DispatchDecision {
  matchedResponder: Responder;
  matchedHospital: Hospital;
  distanceKm: number;
  estimatedArrivalMinutes: number;
  urgencyLevel: 'CRITICAL_RED' | 'HIGH_AMBER' | 'MODERATE_YELLOW';
  triageScore: number;
  suggestedALS: boolean;
  equityPriorityApplied: boolean;
  aiRationale: string;
}

export class AIDispatchEngine {
  /**
   * Evaluates available fleet and selects the optimal responder using multi-variable AI scoring
   */
  public static computeOptimalDispatch(
    citizenLocation: GeoCoordinate,
    category: EmergencyCategory,
    isPeripheralWard: boolean = false,
    availableFleet: Responder[] = INITIAL_RESPONDERS
  ): DispatchDecision {
    const isCritical = ['CARDIAC', 'STROKE', 'RESPIRATORY', 'MATERNAL_CRITICAL'].includes(category);
    const requiresALS = ['CARDIAC', 'STROKE', 'TRAUMA_ACCIDENT'].includes(category);

    // 1. Find nearest trauma hospital
    let nearestHospital = BENGALURU_HOSPITALS[0];
    let minHospDist = Infinity;

    for (const hosp of BENGALURU_HOSPITALS) {
      const dist = calculateHaversineDistanceMeters(
        citizenLocation.latitude,
        citizenLocation.longitude,
        hosp.latitude,
        hosp.longitude
      );
      if (dist < minHospDist) {
        minHospDist = dist;
        nearestHospital = hosp;
      }
    }

    // 2. Score available responders
    // Scoring criteria: Haversine distance (40%), Vehicle capability match (30%), Traffic speed (20%), Equity bonus for peripheral wards (10%)
    let bestResponder = availableFleet[0];
    let highestScore = -Infinity;
    let computedDistanceKm = 3.5;
    let computedEta = 6;

    for (const responder of availableFleet) {
      const distMeters = calculateHaversineDistanceMeters(
        citizenLocation.latitude,
        citizenLocation.longitude,
        responder.currentLocation.latitude,
        responder.currentLocation.longitude
      );
      const distKm = distMeters / 1000;

      // Capability score
      let capabilityScore = 70;
      if (requiresALS && (responder.type === 'ALS_AMBULANCE' || responder.type === 'TRAUMA_MOBILE_ICU')) {
        capabilityScore = 100;
      } else if (!requiresALS && responder.type === 'FIRST_RESPONDER_BIKE') {
        capabilityScore = 95; // Fast bike response for quick assessment
      }

      // Distance score (Closer is higher)
      const distanceScore = Math.max(0, 100 - distKm * 10);

      // Traffic speed factor (Bengaluru traffic index)
      const trafficSpeedKmh = responder.speedKmh || 35;
      const etaMins = Math.max(2, Math.round((distKm / trafficSpeedKmh) * 60 * 1.3)); // 1.3x traffic multiplier

      // Equity fairness bonus if user is in an outer / underserved ward
      const equityBonus = isPeripheralWard ? 15 : 0;

      const totalCompositeScore =
        distanceScore * 0.45 +
        capabilityScore * 0.35 +
        (100 - etaMins * 5) * 0.1 +
        equityBonus;

      if (totalCompositeScore > highestScore) {
        highestScore = totalCompositeScore;
        bestResponder = responder;
        computedDistanceKm = Number(distKm.toFixed(1));
        computedEta = etaMins;
      }
    }

    const triageScore = isCritical ? 95 : category === 'TRAUMA_ACCIDENT' ? 88 : 72;
    const urgencyLevel = triageScore >= 90 ? 'CRITICAL_RED' : triageScore >= 80 ? 'HIGH_AMBER' : 'MODERATE_YELLOW';

    return {
      matchedResponder: { ...bestResponder, etaMinutes: computedEta },
      matchedHospital: nearestHospital,
      distanceKm: computedDistanceKm,
      estimatedArrivalMinutes: computedEta,
      urgencyLevel,
      triageScore,
      suggestedALS: requiresALS,
      equityPriorityApplied: isPeripheralWard,
      aiRationale: `Assigned ${bestResponder.name} (${bestResponder.type}) based on proximity (${computedDistanceKm} km, ETA ~${computedEta} min) & nearest trauma center ${nearestHospital.name}. ${isPeripheralWard ? 'Peripheral Ward equity weighting applied.' : ''}`,
    };
  }

  /**
   * Generates AI First-Aid guidance for the citizen while awaiting the ambulance
   */
  public static getAIFirstAidGuidance(category: EmergencyCategory) {
    switch (category) {
      case 'CARDIAC':
        return {
          urgencyLevel: 'CRITICAL_RED' as const,
          triageScore: 98,
          suggestedALS: true,
          firstAidInstructions: [
            'Keep patient calm, resting comfortably in sitting position.',
            'Loosen tight clothing around neck and chest.',
            'If patient becomes unresponsive, begin CPR: 100-120 chest compressions per minute at center of chest.',
            'Do NOT give solid foods or water. Have Aspirin (300mg) ready if prescribed.'
          ],
          speechSummary: {
            en: 'Help is dispatched! Keep patient sitting comfortably. Loosen tight clothing. If unconscious, begin chest compressions immediately.',
            kn: 'ತುರ್ತು ವಾಹನ ರವಾನಿಸಲಾಗಿದೆ! ರೋಗಿಯನ್ನು ಆರಾಮವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಲು ಬಿಡಿ. ಪ್ರಜ್ಞೆ ತಪ್ಪಿದರೆ ತಕ್ಷಣ ಎದೆಯ ಮೇಲೆ ಒತ್ತಡ ಹಾಕಿ.',
            hi: 'एम्बुलेंस रवाना हो चुकी है! मरीज को आराम से बैठाएं। कपड़े ढीले करें। यदि बेहोश हों तो तुरंत छाती दबाकर CPR शुरू करें।',
            ta: 'உதவி அனுப்பப்பட்டுள்ளது! நோயாளியை அமர வையுங்கள். உடைகளை தளர்த்துங்கள். நினைவிழந்தால் நெஞ்சு அழுத்தம் ஆரம்பியுங்கள்.',
            te: 'సహాయం పంపబడింది! రోగిని కూర్చోబెట్టండి. బట్టలు వదులు చేయండి. స్పృహ కోల్పోతే CPR ప్రారంభించండి.',
            ml: 'സഹായം അയച്ചു! രോഗിയെ ഇരുത്തുക. വസ്ത്രങ്ങൾ അയയ്ക്കുക. ബോധം നഷ്ടപ്പെട്ടാൽ CPR ആരംഭിക്കുക.',
            mr: 'मदत पाठवली आहे! रुग्णाला बसवा. कपडे सैल करा. बेशुद्ध झाल्यास CPR सुरू करा.',
            bn: 'সাহায্য পাঠানো হয়েছে! রোগীকে বসান। পোশাক ঢিলা করুন। অচেতন হলে CPR शुरू করুন।',
            gu: 'મદદ મોકલાઈ છે! દર્દીને બેસાડો. કપડાં છૂટાં કરો. બેભાન થાય તો CPR શરૂ કરો.',
            pa: 'ਮਦਦ ਭੇਜੀ ਗਈ ਹੈ! ਮਰੀਜ਼ ਨੂੰ ਬੈਠਾਓ। ਕੱਪੜੇ ਢਿੱਲੇ ਕਰੋ। ਬੇਹੋਸ਼ ਹੋਵੇ ਤਾਂ CPR ਸ਼ੁਰੂ ਕਰੋ।'
          }
        };

      case 'TRAUMA_ACCIDENT':
        return {
          urgencyLevel: 'CRITICAL_RED' as const,
          triageScore: 92,
          suggestedALS: true,
          firstAidInstructions: [
            'Apply firm, direct pressure to any active bleeding wound with a clean cloth.',
            'Do NOT move patient if neck or spinal injury is suspected unless in immediate danger.',
            'Keep patient warm with a jacket or blanket to prevent trauma shock.',
            'Check breathing and keep airway clear.'
          ],
          speechSummary: {
            en: 'Ambulance is en route! Apply firm pressure on bleeding areas. Do not move patient neck or spine.',
            kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ! ರಕ್ತಸ್ರಾವವಿರುವ ಜಾಗಕ್ಕೆ ಬಟ್ಟೆಯಿಂದ ಗಟ್ಟಿಯಾಗಿ ಒತ್ತಿ ಹಿಡಿಯಿರಿ. ರೋಗಿಯನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ.',
            hi: 'एम्बुलेंस आ रही है! बहते खून पर साफ कपड़े से दबाव बनाएं। मरीज की गर्दन या रीढ़ को बिल्कुल न हिलाएं।',
            ta: 'ஆம்புலன்ஸ் வருகிறது! இரத்தப்போக்கு உள்ள இடத்தில் துணியால் அழுத்துங்கள். கழுத்தை அசைக்க வேண்டாம்.',
            te: 'అంబులెన్స్ వస్తోంది! రక్తం కారే చోట గట్టిగా అదిమి పట్టండి. మెడ కదపవద్దు.',
            ml: 'ആംബുലൻസ് വരുന്നു! രക്തസ്രാവ ഭാഗത്ത് തുണി കൊണ്ട് അമർത്തുക. കഴുത്ത് ഇളക്കരുത്.',
            mr: 'रुग्णवाहिका येत आहे! रक्तस्रावावर कापडाने दाबा. मान हलवू नका.',
            bn: 'অ্যাম্বুলেন্স আসছে! রক্তপাতে কাপড় দিয়ে চাপ দিন। ঘাড় নাড়াবেন না।',
            gu: 'એમ્બ્યુલન્સ આવી રહી છે! લોહી નીકળતી જગ્યાએ કાપડથી દબાવો. ગરદન હલાવશો નહીં.',
            pa: 'ਐਂਬੂਲੈਂਸ ਆ ਰਹੀ ਹੈ! ਖੂਨ ਵਹਿੰਦੀ ਥਾਂ ਤੇ ਕੱਪੜੇ ਨਾਲ ਦਬਾਓ। ਗਰਦਨ ਨਾ ਹਿਲਾਓ।'
          }
        };

      case 'STROKE':
        return {
          urgencyLevel: 'CRITICAL_RED' as const,
          triageScore: 95,
          suggestedALS: true,
          firstAidInstructions: [
            'Check FAST symptoms: Face drooping, Arm weakness, Speech difficulty, Time.',
            'Keep patient lying down on their side (recovery position) with head slightly raised.',
            'Do NOT give aspirin, medication, food, or drink.',
            'Note the exact time symptoms started.'
          ],
          speechSummary: {
            en: 'Stroke response activated! Keep patient on their side with head elevated. Do not give any food or liquids.',
            kn: 'ಪಾರ್ಶ್ವವಾಯು ತುರ್ತು ಸ್ಪಂದನೆ ಸಕ್ರಿಯವಾಗಿದೆ! ರೋಗಿಯನ್ನು ಒಂದು ಬದಿಗೆ ಮಲಗಿಸಿ, ತಲೆಯನ್ನು ಸ್ವಲ್ಪ ಎತ್ತರದಲ್ಲಿಡಿ. ನೀರು ಅಥವಾ ಆಹಾರ ಕೊಡಬೇಡಿ.',
            hi: 'स्ट्रोक प्रोटोकॉल सक्रिय है! मरीज को करवट के बल लिटाएं और सिर थोड़ा ऊपर रखें। कुछ भी खाने या पीने को न दें।',
            ta: 'பக்கவாத முதலுதவி செயல்படுத்தப்பட்டது! நோயாளியை ஒரு பக்கமாக படுக்க வையுங்கள்.',
            te: 'స్ట్రోక్ ప్రతిస్పందన సక్రియం! రోగిని ఒక వైపుకు తిప్పి తలను పైకి ఉంచండి.',
            ml: 'സ്ട്രോക്ക് പ്രതികരണം സജീവം! രോഗിയെ ഒരു വശത്തേക്ക് കിടത്തുക.',
            mr: 'स्ट्रोक प्रोटोकॉल सक्रिय! रुग्णाला एका बाजूला झोपवा. डोके उंच ठेवा.',
            bn: 'স্ট্রোক প্রোটোকল সক্রিয়! রোগীকে একপাশে শুইয়ে মাথা উঁচু রাখুন।',
            gu: 'સ્ટ્રોક પ્રોટોકોલ સક્રિય! દર્દીને એક બાજુ સુવડાવો. માથું ઊંચું રાખો.',
            pa: 'ਸਟ੍ਰੋਕ ਪ੍ਰੋਟੋਕੋਲ ਸਰਗਰਮ! ਮਰੀਜ਼ ਨੂੰ ਇੱਕ ਪਾਸੇ ਲਿਟਾਓ। ਸਿਰ ਉੱਚਾ ਰੱਖੋ।'
          }
        };

      case 'RESPIRATORY':
        return {
          urgencyLevel: 'HIGH_AMBER' as const,
          triageScore: 86,
          suggestedALS: true,
          firstAidInstructions: [
            'Help patient sit upright, leaning slightly forward with hands on knees (tripod position).',
            'Ensure fresh airflow; open windows or loosen tight collars.',
            'Assist with prescribed asthma inhaler or oxygen if immediately available.',
            'Encourage slow, pursed-lip breathing.'
          ],
          speechSummary: {
            en: 'Paramedics on the way. Sit upright and lean slightly forward. Use inhaler if prescribed.',
            kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ. ರೋಗಿ ನೇರವಾಗಿ ಕುಳಿತು ಸ್ವಲ್ಪ ಮುಂದಕ್ಕೆ ಬಾಗಲು ಸಹಾಯ ಮಾಡಿ. ಇನ್ಹೇಲರ್ ಇದ್ದರೆ ಬಳಸಿ.',
            hi: 'मदद रास्ते में है। मरीज को सीधा बैठाकर आगे झुकने दें। यदि इनहेलर है तो तुरंत उपयोग कराएं।',
            ta: 'மருத்துவர்கள் வருகிறார்கள். நேராக உட்காருங்கள். இன்ஹேலர் இருந்தால் பயன்படுத்துங்கள்.',
            te: 'వైద్యులు వస్తున్నారు. నిటారుగా కూర్చోండి. ఇన్హేలర్ ఉంటే వాడండి.',
            ml: 'മെഡിക്കൽ ടീം വരുന്നു. നേരെ ഇരിക്കുക. ഇൻഹേലർ ഉണ്ടെങ്കിൽ ഉപയോഗിക്കുക.',
            mr: 'वैद्यकीय पथक येत आहे. सरळ बसा. इनहेलर असल्यास वापरा.',
            bn: 'চিকিৎসা দল আসছে। সোজা হয়ে বসুন। ইনহেলার থাকলে ব্যবহার করুন।',
            gu: 'તબીબી ટીમ આવી રહી છે. સીધા બેસો. ઇન્હેલર હોય તો વાપરો.',
            pa: 'ਡਾਕਟਰੀ ਟੀਮ ਆ ਰਹੀ ਹੈ। ਸਿੱਧੇ ਬੈਠੋ। ਇਨਹੇਲਰ ਹੋਵੇ ਤਾਂ ਵਰਤੋ।'
          }
        };

      case 'ELDERLY_FALL':
        return {
          urgencyLevel: 'HIGH_AMBER' as const,
          triageScore: 80,
          suggestedALS: false,
          firstAidInstructions: [
            'Do NOT rush to pull the person up immediately; check for hip or head pain.',
            'Support the head and limbs with cushions or folded blankets.',
            'Cover with a warm blanket and reassure calmly.',
            'First responder unit is equipped with geriatric immobilization support.'
          ],
          speechSummary: {
            en: 'Help is dispatched. Do not lift the person up quickly. Keep them warm and supported.',
            kn: 'ಸಹಾಯ ಬರುತ್ತಿದೆ. ಬಿದ್ದಿರುವ ವ್ಯಕ್ತಿಯನ್ನು ತಕ್ಷಣ ಎತ್ತಬೇಡಿ. ಬೆಚ್ಚಗಿರಿಸಿ ಸಮಾಧಾನಪಡಿಸಿ.',
            hi: 'सहायता आ रही है। व्यक्ति को एकदम से न उठाएं। उन्हें कंबल से ढकें और शांत रखें।',
            ta: 'உதவி வருகிறது. நபரை விரைவாக தூக்க வேண்டாம். சூடாக வையுங்கள்.',
            te: 'సహాయం వస్తోంది. వ్యక్తిని త్వరగా లేపవద్దు. వెచ్చగా ఉంచండి.',
            ml: 'സഹായം വരുന്നു. വ്യക്തിയെ വേഗം എഴുന്നേൽപ്പിക്കരുത്. ചൂടാക്കി വയ്ക്കുക.',
            mr: 'मदत येत आहे. व्यक्तीला लगेच उचलू नका. उबदार ठेवा.',
            bn: 'সাহায্য আসছে। ব্যক্তিকে তাড়াতাড়ি তুলবেন না। উষ্ণ রাখুন।',
            gu: 'મદદ આવી રહી છે. વ્યક્તિને ઝડપથી ઉઠાવશો નહીં. ગરમ રાખો.',
            pa: 'ਮਦਦ ਆ ਰਹੀ ਹੈ। ਵਿਅਕਤੀ ਨੂੰ ਜਲਦੀ ਨਾ ਚੁੱਕੋ। ਗਰਮ ਰੱਖੋ।'
          }
        };

      default:
        return {
          urgencyLevel: 'HIGH_AMBER' as const,
          triageScore: 78,
          suggestedALS: false,
          firstAidInstructions: [
            'Stay with the patient in a safe, shaded location.',
            'Keep emergency phone line clear for dispatcher calls.',
            'Prepare patient medical history and current prescription details for the crew.'
          ],
          speechSummary: {
            en: 'Emergency request registered. Stay calm and keep phone line open.',
            kn: 'ತುರ್ತು ವಿನಂತಿ ದಾಖಲಾಗಿದೆ. ಶಾಂತವಾಗಿರಿ, ತುರ್ತು ತಂಡ ತಕ್ಷಣ ತಲುಪಲಿದೆ.',
            hi: 'आपातकालीन अनुरोध दर्ज कर लिया गया है। शांत रहें, बचाव दल जल्द पहुंच रहा है।',
            ta: 'அவசர கோரிக்கை பதிவாகியுள்ளது. அமைதியாக இருங்கள்.',
            te: 'అత్యవసర అభ్యర్థన నమోదైంది. ప్రశాంతంగా ఉండండి.',
            ml: 'അടിയന്തര അഭ്യർത്ഥന രജിസ്റ്റർ ചെയ്തു. ശാന്തമായിരിക്കുക.',
            mr: 'आणीबाणी विनंती नोंदवली. शांत राहा.',
            bn: 'জরুরি অনুরোধ নথিভুক্ত হয়েছে। শান্ত থাকুন।',
            gu: 'કટોકટી વિનંતી નોંધાઈ છે. શાંત રહો.',
            pa: 'ਐਮਰਜੈਂਸੀ ਬੇਨਤੀ ਦਰਜ ਹੋ ਗਈ ਹੈ। ਸ਼ਾਂਤ ਰਹੋ।'
          }
        };
    }
  }
}
