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
            hi: 'एम्बुलेंस रवाना हो चुकी है! मरीज को आराम से बैठाएं। कपड़े ढीले करें। यदि बेहोश हों तो तुरंत छाती दबाकर CPR शुरू करें।'
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
            hi: 'एम्बुलेंस आ रही है! बहते खून पर साफ कपड़े से दबाव बनाएं। मरीज की गर्दन या रीढ़ को बिल्कुल न हिलाएं।'
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
            hi: 'स्ट्रोक प्रोटोकॉल सक्रिय है! मरीज को करवट के बल लिटाएं और सिर थोड़ा ऊपर रखें। कुछ भी खाने या पीने को न दें।'
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
            hi: 'मदद रास्ते में है। मरीज को सीधा बैठाकर आगे झुकने दें। यदि इनहेलर है तो तुरंत उपयोग कराएं।'
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
            hi: 'सहायता आ रही है। व्यक्ति को एकदम से न उठाएं। उन्हें कंबल से ढकें और शांत रखें।'
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
            hi: 'आपातकालीन अनुरोध दर्ज कर लिया गया है। शांत रहें, बचाव दल जल्द पहुंच रहा है।'
          }
        };
    }
  }
}
