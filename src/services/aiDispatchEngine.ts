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
            ta: 'ஆம்புலன்ஸ் புறப்பட்டது! நோயாளியை வசதியாக உட்கார வைக்கவும். இறுக்கமான ஆடைகளைத் தளர்த்தவும். மயக்கமடைந்தால் CPR தொடங்கவும்.',
            te: 'అంబులెన్స్ బయలుదేరింది! రోగిని ప్రశాంతంగా కూర్చోబెట్టండి. బట్టలు వదులు చేయండి. స్పృహ తప్పితే వెంటనే CPR ప్రారంభించండి.',
            ml: 'ആംബുലൻസ് പുറപ്പെട്ടു! രോഗിയെ സുഖമായി ഇരുത്തുക. ഇറുകിയ വസ്ത്രങ്ങൾ അയക്കുക. ബോധരഹിതനായാൽ ഉടൻ CPR ആരംഭിക്കുക.',
            mr: 'रुग्णवाहिका निघाली आहे! रुग्णाला शांत बसवा. घट्ट कपडे सैल करा. बेशुद्ध असल्यास त्वरित CPR सुरू करा.',
            bn: 'অ্যাম্বুলেন্স রওনা হয়েছে! রোগীকে শান্তভাবে বসিয়ে রাখুন। পোশাক ঢিলে করুন। অজ্ঞান হলে অবিলম্বে CPR শুরু করুন।',
            gu: 'એમ્બ્યુલન્સ રવાના થઈ ગઈ છે! દર્દીને આરામથી બેસાડો. ચુસ્ત કપડાં ઢીલા કરો. જો બેહોશ હોય તો તરત જ CPR શરૂ કરો.',
            pa: 'ਐਂਬੂਲੈਂਸ ਰਵਾਨਾ ਹੋ ਚੁੱਕੀ ਹੈ! ਮਰੀਜ਼ ਨੂੰ ਆਰਾਮ ਨਾਲ ਬਿਠਾਓ। ਤੰਗ ਕੱਪੜੇ ਢਿੱਲੇ ਕਰੋ। ਜੇਕਰ ਬੇਹੋਸ਼ ਹੋਵੇ ਤਾਂ ਤੁਰੰਤ CPR ਸ਼ੁਰੂ ਕਰੋ।',
            or: 'ଆମ୍ବୁଲାନ୍ସ ବାହାରି ସାରିଛି! ରୋଗୀଙ୍କୁ ଶାନ୍ତ ଭାବରେ ବସାନ୍ତୁ। ଚିପା ପୋଷାକ ଢିଲା କରନ୍ତୁ। ଚେତା ହରାଇଲେ ତୁରନ୍ତ CPR ଆରମ୍ଭ କରନ୍ତୁ।',
            as: 'এম্বুলেন্স ৰাওনা হৈছে! ৰোগীক আৰামেৰে বহিবলৈ দিয়ক। কাপোৰ ঢিলা কৰক। অজ্ঞান হ’লে ততালিকে CPR আৰম্ভ কৰক।',
            ur: 'ایمبولینس روانہ ہو چکی ہے! مریض کو آرام سے بٹھائیں۔ کپڑے ڈھیلے کریں۔ بے ہوش ہونے پر فوراً CPR شروع کریں۔'
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
            ta: 'ஆம்புலன்ஸ் வருகிறது! ரத்தப்போக்கு உள்ள இடத்தில் அழுத்தவும். கழுத்து அல்லது முதுகை அசைக்க வேண்டாம்.',
            te: 'అంబులెన్స్ వస్తోంది! రక్తస్రావం జరుగుతున్న చోట గట్టిగా నొక్కండి. రోగి మెడ లేదా వెన్నుపామును కదల్చవద్దు.',
            ml: 'ആംബുലൻസ് വരുന്നു! രക്തസ്രാവമുള്ള ഭാഗത്ത് അമർത്തിപ്പിടിക്കുക. രോഗിയുടെ കഴുത്തോ നട്ടെല്ലോ അനക്കരുത്.',
            mr: 'रुग्णवाहिका येत आहे! रक्तस्त्राव होत असलेल्या भागावर दाब द्या. मान किंवा पाठीचा कणा हलवू नका.',
            bn: 'অ্যাম্বুলেন্স আসছে! রক্তক্ষরণ স্থানে পরিষ্কার কাপড় দিয়ে চাপ দিন। ঘাড় বা মেরুদণ্ড নাড়াবেন না।',
            gu: 'એમ્બ્યુલન્સ આવી રહી છે! લોહી વહેતા ભાગ પર દબાણ આપો. દર્દીની ગરદન કે કરોડરજ્જુ હલાવશો નહીં.',
            pa: 'ਐਂਬੂਲੈਂਸ ਆ ਰਹੀ ਹੈ! ਖੂਨ ਵਗਣ ਵਾਲੀ ਥਾਂ ਤੇ ਦਬਾਅ ਪਾਓ। ਗਰਦਨ ਜਾਂ ਰੀੜ੍ਹ ਦੀ ਹੱਡੀ ਨੂੰ ਨਾ ਹਿਲਾਓ।',
            or: 'ଆମ୍ବୁଲାନ୍ସ ଆସୁଛି! ରକ୍ତସ୍ରାବ ସ୍ଥାନରେ ଚାପ ଦିଅନ୍ତୁ। ରୋଗୀର ବେକ କିମ୍ବା ମେରୁଦଣ୍ଡ ହଲାନ୍ତୁ ନାହିଁ।',
            as: 'এম্বুলেন্স আহি আছে! ৰক্তক্ষৰণ হোৱা স্থানত চাপ দিয়ক। ৰোগীৰ ডিঙি বা ৰাজহাড় লৰচৰ নকৰিব।',
            ur: 'ایمبولینس آ رہی ہے! خون بہنے والی جگہ پر دباؤ ڈالیں۔ گردن یا ریڑھ کی ہڈی کو مت ہلائیں۔'
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
            ta: 'பக்கவாத உதவி புறப்பட்டது! நோயாளியை ஒருபக்கமாக படுக்க வைக்கவும். உணவு அல்லது தண்ணீர் கொடுக்க வேண்டாம்.',
            te: 'స్ట్రోక్ స్పందన ప్రారంభమైంది! రోగిని ఒకవైపునకు పడుకోబెట్టి తల కొద్దిగా పైకి ఉంచండి. ఆహారం లేదా నీరు ఇవ్వవద్దు.',
            ml: 'സ്ട്രോക്ക് അടിയന്തര സഹായം ലഭ്യമാക്കി! രോഗിയെ ഒരു വശത്തേക്ക് ചരിച്ച് കിടത്തുക. ഭക്ഷണവും വെള്ളവും നൽകരുത്.',
            mr: 'स्ट्रोक प्रतिसाद सक्रिय झाला आहे! रुग्णाला एका कुशीवर झोपवा आणि डोके थोडे वर ठेवा. अन्न किंवा पाणी देऊ नका.',
            bn: 'স্ট্রোক সহায়তা সক্রিয়! রোগীকে একপাশে কাত করে শোয়ান। কোনো খাবার বা তরল দেবেন না।',
            gu: 'સ્ટ્રોક રિસ્પોન્સ સક્રિય થયો છે! દર્દીને એક પડખે સુવડાવો અને માથું સહેજ ઊંચું રાખો. કશું ખાવા-પીવા ન આપો.',
            pa: 'ਸਟ੍ਰੋਕ ਰਿਸਪਾਂਸ ਸ਼ੁਰੂ! ਮਰੀਜ਼ ਨੂੰ ਇੱਕ ਪਾਸੇ ਲਿਟਾਓ। ਖਾਣ ਜਾਂ ਪੀਣ ਲਈ ਕੁਝ ਨਾ ਦਿਓ।',
            or: 'ଷ୍ଟ୍ରୋକ୍ ପ୍ରତିକ୍ରିୟା ସକ୍ରିୟ! ରୋଗୀଙ୍କୁ ଏକ ପାଖ କରି ଶୁଆନ୍ତୁ। କୌଣସି ଖାଦ୍ୟ କିମ୍ବା ପାଣି ଦିଅନ୍ତୁ ନାହିଁ।',
            as: 'ষ্ট্ৰোক প্ৰটোকল সক্ৰিয়! ৰোগীক এফালে কাটি কৰি শুৱাই দিয়ক। কোনো খাদ্য বা পানী নিদিব।',
            ur: 'فالج کا پروٹوکول فعال ہے! مریض کو کروٹ کے بل لٹائیں اور سر تھوڑا اونچا رکھیں۔ کچھ بھی کھانے پینے کو نہ دیں۔'
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
            ta: 'உதவி வருகிறது. நோயாளியை நிமிர்ந்து உட்கார வைத்து சற்று முன்னோக்கி சாய்க்கவும். இன்ஹேலரை பயன்படுத்தவும்.',
            te: 'సహాయం వస్తోంది. రోగిని నిటారుగా కూర్చోబెట్టి కొద్దిగా ముందుకు వంగేలా చేయండి. ఇన్హేలర్ వాడండి.',
            ml: 'സഹായം എത്തുന്നു. രോഗിയെ നേരെ ഇരുത്തി മുന്നോട്ട് ആഞ്ഞിരിക്കാൻ സഹായിക്കുക. ഇൻഹേലർ ഉപയോഗിക്കുക.',
            mr: 'मदत येत आहे. रुग्णाला सरळ बसवून थोडे पुढे झुकू द्या. इनहेलर असल्यास वापर करा.',
            bn: 'সাহায্য আসছে। রোগীকে সোজা করে বসিয়ে সামনের দিকে সামান্য ঝুঁকিয়ে দিন। ইনহেলার ব্যবহার করান।',
            gu: 'મદદ આવી રહી છે. દર્દીને સીધા બેસાડો અને સહેજ આગળ નમવા દો. ઇનહેલરનો ઉપયોગ કરાવો.',
            pa: 'ਮਦਦ ਆ ਰਹੀ ਹੈ। ਮਰੀਜ਼ ਨੂੰ ਸਿੱਧਾ ਬਿਠਾਓ ਅਤੇ ਅੱਗੇ ਝੁਕਣ ਦਿਓ। ਇਨਹੇਲਰ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
            or: 'ସହାୟତା ଆସୁଛି। ରୋଗୀଙ୍କୁ ସିଧା ବସାଇ ଆଗକୁ ଝୁଙ୍କିବାକୁ କୁହନ୍ତୁ। ଇନହେଲର ବ୍ୟବହାର କରନ୍ତୁ।',
            as: 'সহায় আহি আছে। ৰোগীক পোন হৈ বহিবলৈ দিয়ক আৰু অলপ আগলৈ হাউলিবলৈ দিয়ক। ইনহেলাৰ ব্যৱহাৰ কৰক।',
            ur: 'مدد آ رہی ہے۔ مریض کو سیدھا بٹھا کر آگے جھکنے دیں۔ انہیلر استعمال کروائیں۔'
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
            ta: 'உதவி புறப்பட்டது. விழுந்தவரை உடனே அவசரமாக தூக்க வேண்டாம். அவர்களை கதகதப்பாக வைத்திருங்கள்.',
            te: 'సహాయం వస్తోంది. కింద పడిన వ్యక్తిని వెంటనే లేపవద్దు. దుప్పటి కప్పి ప్రశాంతంగా ఉంచండి.',
            ml: 'സഹായം എത്തുന്നു. വീണ ആളെ പെട്ടെന്ന് എഴുന്നേൽപ്പിക്കരുത്. പുതപ്പ് നൽകി ശാന്തമാക്കുക.',
            mr: 'मदत येत आहे. पडलेल्या व्यक्तीला घाईघाईने उठवू नका. त्यांना उबदार ठेवा आणि धीर द्या.',
            bn: 'সাহায্য পাঠানো হয়েছে। রোগীকে হুট করে ওঠাবেন না। উষ্ণ রাখুন এবং আশ্বস্ত করুন।',
            gu: 'મદદ આવી રહી છે. પડેલી વ્યક્તિને તરત જ ઊભી ન કરો. તેમને ગરમ ધાબળો ઓઢાડો અને શાંત રાખો.',
            pa: 'ਮਦਦ ਭੇਜੀ ਗਈ ਹੈ। ਡਿੱਗੇ ਹੋਏ ਵਿਅਕਤੀ ਨੂੰ ਇਕਦਮ ਨਾ ਚੁੱਕੋ। ਨਿੱਘਾ ਰੱਖੋ ਅਤੇ ਹੌਸਲਾ ਦਿਓ।',
            or: 'ସହାୟତା ଆସୁଛି। ପଡ଼ିଥିବା ବ୍ୟକ୍ତିଙ୍କୁ ତୁରନ୍ତ ଉଠାନ୍ତୁ ନାହିଁ। କମ୍ବଳ ଘୋଡ଼ାଇ ଶାନ୍ତ ରଖନ୍ତୁ।',
            as: 'সহায় আহি আছে। পৰি যোৱা ব্যক্তিক ততালিকে উঠাই নিদিব। গৰম কাপোৰেৰে ঢাকি শান্ত কৰক।',
            ur: 'مدد آ رہی ہے۔ گرنے والے شخص کو فوری طور پر نہ اٹھائیں۔ انہیں گرم رکھیں اور تسلی دیں۔'
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
            ta: 'அவசர கோரிக்கை பதிவு செய்யப்பட்டது. அமைதியாக இருங்கள், உதவி விரைந்து வருகிறது.',
            te: 'అత్యవసర అభ్యర్థన నమోదైంది. ప్రశాంతంగా ఉండండి, సహాయక బృందం త్వరలో చేరుకుంటుంది.',
            ml: 'അടിയന്തര അഭ്യർത്ഥന രജിസ്റ്റർ ചെയ്തു. ശാന്തത പാലിക്കുക, രക്ഷാപ്രവർത്തകർ ഉടൻ എത്തും.',
            mr: 'आपत्कालीन विनंती नोंदवली आहे. शांत राहा, पथक लवकरच पोहोचत आहे.',
            bn: 'জরুরি অনুরোধ নথিভুক্ত হয়েছে। শান্ত থাকুন, উদ্ধারকারী দল শীঘ্রই পৌঁছাচ্ছে।',
            gu: 'કટોકટીની વિનંતી નોંધાઈ છે. શાંત રહો, બચાવ ટુકડી ટૂંક સમયમાં પહોંચી રહી છે.',
            pa: 'ਸੰਕਟਕਾਲੀਨ ਬੇਨਤੀ ਦਰਜ ਹੋ ਗਈ ਹੈ। ਸ਼ਾਂਤ ਰਹੋ, ਟੀਮ ਜਲਦੀ ਪਹੁੰਚ ਰਹੀ ਹੈ।',
            or: 'ଜରୁରୀ ଅନୁରୋଧ ଦାଖଲ ହୋଇଛି। ଶାନ୍ତ ରୁହନ୍ତୁ, ଉଦ୍ଧାରକାରୀ ଦଳ ଖୁବ୍ ଶୀଘ୍ର ପହଞ୍ଚିବେ।',
            as: 'জৰুৰী অনুৰোধ পঞ্জীয়ন হ’ল। শান্ত থাকক, সাহায্যকাৰী দল সোনকালে উপস্থিত হ’ব।',
            ur: 'ہنگامی درخواست درج کر لی گئی ہے۔ پُرسکون رہیں، ریسکیو ٹیم جلد پہنچ رہی ہے۔'
          }
        };

    }
  }
}
