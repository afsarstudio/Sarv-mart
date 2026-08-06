export interface DeliveryEstimate {
  pincode: string;
  areaName: string;
  minMins: number;
  maxMins: number;
  timeWindowString: string; // e.g. "15-20 mins"
  fullStatement: string;   // e.g. "Deliveries to Behta Bazar arrive in 15-20 mins"
  statusBadge: string;     // e.g. "Normal Traffic", "Peak Rush (+7 min)", etc.
  trafficLevel: 'low' | 'moderate' | 'heavy' | 'night';
}

const PINCODE_MAP: Record<string, { areaName: string; baseMin: number; baseMax: number }> = {
  '226026': { areaName: 'Behta Bazar', baseMin: 12, baseMax: 18 },
  '226028': { areaName: 'Rajajipuram', baseMin: 15, baseMax: 22 },
  '226003': { areaName: 'Chowk', baseMin: 18, baseMax: 25 },
  '226005': { areaName: 'Alambagh', baseMin: 22, baseMax: 30 },
  '226001': { areaName: 'Hazratganj', baseMin: 25, baseMax: 35 },
  '226010': { areaName: 'Gomti Nagar', baseMin: 30, baseMax: 40 },
  '226016': { areaName: 'Indira Nagar', baseMin: 32, baseMax: 42 },
  '226004': { areaName: 'Charbagh', baseMin: 20, baseMax: 28 },
  '226020': { areaName: 'Mahanagar', baseMin: 28, baseMax: 38 },
  '226022': { areaName: 'Aliganj', baseMin: 26, baseMax: 36 },
};

export function getDeliveryEstimate(pincode: string, customDate?: Date): DeliveryEstimate {
  const date = customDate || new Date();
  const hour = date.getHours();

  const cleanPin = (pincode || '226026').trim();
  const pinData = PINCODE_MAP[cleanPin] || {
    areaName: `Area ${cleanPin}`,
    baseMin: 20,
    baseMax: 30,
  };

  let minAdd = 0;
  let maxAdd = 0;
  let trafficLevel: 'low' | 'moderate' | 'heavy' | 'night' = 'low';
  let statusBadge = 'Express Flow';

  if (hour >= 8 && hour < 10) {
    minAdd = 3;
    maxAdd = 6;
    trafficLevel = 'moderate';
    statusBadge = 'Morning Peak Traffic';
  } else if (hour >= 17 && hour < 21) {
    minAdd = 5;
    maxAdd = 8;
    trafficLevel = 'heavy';
    statusBadge = 'Evening Rush Hour';
  } else if (hour >= 22 || hour < 6) {
    minAdd = 8;
    maxAdd = 12;
    trafficLevel = 'night';
    statusBadge = 'Night Express Slot';
  } else {
    minAdd = 0;
    maxAdd = 2;
    trafficLevel = 'low';
    statusBadge = 'Smooth Flow';
  }

  const finalMin = pinData.baseMin + minAdd;
  const finalMax = pinData.baseMax + maxAdd;
  const timeWindowString = `${finalMin}-${finalMax} mins`;
  const fullStatement = `Deliveries to ${pinData.areaName} arrive in ${timeWindowString}`;

  return {
    pincode: cleanPin,
    areaName: pinData.areaName,
    minMins: finalMin,
    maxMins: finalMax,
    timeWindowString,
    fullStatement,
    statusBadge,
    trafficLevel,
  };
}
