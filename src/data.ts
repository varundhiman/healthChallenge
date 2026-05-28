import { User, Group, Challenge, ChallengeProgress, LeaderboardEntry } from './types';

// Predefined mock users who compete with the current user
export const MOCK_COMPETITORS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex "Apex" Mercer',
    avatar: '🏃‍♂️',
    email: 'alex.apex@pulse.com',
    healthProvider: 'apple',
    sharedData: { heartRate: true, steps: true, sleep: true },
    points: 840,
  },
  {
    id: 'user_sarah',
    name: 'Sarah "Cardio" Chen',
    avatar: '⚡',
    email: 'sarah.chen@cyclist.org',
    healthProvider: 'google',
    sharedData: { heartRate: true, steps: true, sleep: false },
    points: 790,
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    avatar: '💪',
    email: 'm.vance@beastmode.net',
    healthProvider: 'apple',
    sharedData: { heartRate: true, steps: false, sleep: true },
    points: 620,
  },
  {
    id: 'user_emily',
    name: 'Emily "Zen" Sato',
    avatar: '🧘‍♀️',
    email: 'emily.sato@calm.me',
    healthProvider: 'google',
    sharedData: { heartRate: true, steps: true, sleep: true },
    points: 480,
  },
  {
    id: 'user_lucas',
    name: 'Lucas "Pulse" Thorne',
    avatar: '🔥',
    email: 'lucas.thorne@tempo.com',
    healthProvider: 'apple',
    sharedData: { heartRate: true, steps: true, sleep: false },
    points: 910,
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'group_elite',
    name: 'Savage Cardio Club',
    description: 'High intensity heart rate runners, cyclers, and daily desk-breakers raising their BPM every single hour.',
    creatorId: 'user_alex',
    members: ['user_alex', 'user_sarah', 'user_lucas'],
    challengeIds: ['challenge_hourly_130', 'challenge_daily_hiit']
  },
  {
    id: 'group_office',
    name: 'Desk Workers United',
    description: 'Office warriors ensuring we stand up, move, and spike our heart rate hourly to combat desk fatigue.',
    creatorId: 'user_sarah',
    members: ['user_sarah', 'user_marcus', 'user_emily'],
    challengeIds: ['challenge_hourly_130']
  },
  {
    id: 'group_family',
    name: 'Pulse Masters Syndicate',
    description: 'A close-knit group monitoring dynamic cardio efficiency and friendly competitive metrics.',
    creatorId: 'user_marcus',
    members: ['user_alex', 'user_marcus', 'user_emily', 'user_lucas'],
    challengeIds: ['challenge_hourly_130', 'challenge_cardio_efficiency']
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'challenge_hourly_130',
    name: 'Hourly BPM Boost',
    description: 'Spike your heart rate to at least 130 BPM for a minimum of 5 minutes during every hour of the active day (8 AM to 8 PM).',
    targetBpm: 130,
    durationMinutes: 5,
    intervalType: 'hourly',
    groupId: 'group_elite',
    creatorId: 'user_alex'
  },
  {
    id: 'challenge_daily_hiit',
    name: 'Elite Cardio Burst',
    description: 'Maintain a heart rate above 140 BPM for at least 20 consecutive minutes daily.',
    targetBpm: 140,
    durationMinutes: 20,
    intervalType: 'daily',
    groupId: 'group_elite',
    creatorId: 'user_alex'
  },
  {
    id: 'challenge_cardio_efficiency',
    name: 'Steady Tempo Check-in',
    description: 'Hold your heart rate above 120 BPM for at least 15 continuous minutes twice daily.',
    targetBpm: 120,
    durationMinutes: 15,
    intervalType: 'daily',
    groupId: 'group_family',
    creatorId: 'user_marcus'
  }
];

// Helper to get structured mock timeline performance for competitors
export const getCompetitorDailyProgress = (
  competitorId: string, 
  challengeId: string,
  dateString: string
): ChallengeProgress => {
  // We'll deterministically generate pre-load progress records based on user profile and day
  // Hours of tracking: 0 to 23. Active hours are usually 8 AM to 8 PM (8 to 20)
  const activeHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  
  // Seed-based success rate based on competitor id
  let successProbability = 0.5;
  if (competitorId === 'user_alex') successProbability = 0.85; // highly active
  if (competitorId === 'user_lucas') successProbability = 0.90; // super beast
  if (competitorId === 'user_sarah') successProbability = 0.75; // runner
  if (competitorId === 'user_marcus') successProbability = 0.60;
  if (competitorId === 'user_emily') successProbability = 0.45;

  const hourlyTimeline: ChallengeProgress['hourlyTimeline'] = {};
  let totalCompletedHours = 0;

  for (let hour = 0; hour < 24; hour++) {
    // Competitors don't usually work out in sleep hours (11 PM to 6 AM)
    const isSleeping = hour < 7 || hour > 22;
    const isActiveTrackedHour = activeHours.includes(hour);
    
    // Hash-like deterministic random value based on competitor + hour + date
    const stateSeed = (competitorId.charCodeAt(5) || 0) + hour + dateString.charCodeAt(dateString.length - 1);
    const rand = (Math.sin(stateSeed) + 1) / 2;

    const isSuccess = isActiveTrackedHour && (rand < successProbability);
    const maxBpm = isSuccess 
      ? Math.floor(132 + rand * 30) // 132 to 162
      : isSleeping 
        ? Math.floor(55 + rand * 15)  // 55 to 70 resting
        : Math.floor(75 + rand * 35); // 75 to 110 resting/moving

    const durationAtTargetMinutes = isSuccess 
      ? Math.floor(5 + rand * 12) // 5 to 17 minutes
      : (isActiveTrackedHour && rand > 0.85) 
        ? Math.floor(1 + rand * 3) // 1 to 3 minutes (almost made it)
        : 0;

    const finalSuccess = isSuccess && durationAtTargetMinutes >= 5;

    hourlyTimeline[hour] = {
      maxBpm,
      durationAtTargetMinutes,
      success: finalSuccess
    };

    if (finalSuccess && isActiveTrackedHour) {
      totalCompletedHours++;
    }
  }

  // Active target is 13 active hours
  const overallSuccess = totalCompletedHours >= 10; 

  return {
    userId: competitorId,
    challengeId,
    date: dateString,
    hourlyTimeline,
    totalCompletedHours,
    overallSuccess
  };
};

// Generate realistic simulated heart rate logs for the current user's session
export const generateSimulatedHeartRateHistory = (
  hour: number,
  isWorkout: boolean,
  baseBpm: number = 72
): { bpm: number; timestamp: string }[] => {
  const points: { bpm: number; timestamp: string }[] = [];
  const baseDate = new Date();
  baseDate.setHours(hour, 0, 0, 0);

  // Generate 60 measurements (1 per minute for that hour)
  for (let min = 0; min < 60; min++) {
    const timestamp = new Date(baseDate.getTime() + min * 60 * 1000).toISOString();
    let bpm = baseBpm;

    if (isWorkout) {
      // Simulate physical workout peaking in the middle of the hour
      if (min < 10) {
        // Warm up
        bpm = Math.floor(baseBpm + (min / 10) * 60); // ramp up to 132
      } else if (min >= 10 && min < 25) {
        // High Intensity
        const noise = Math.sin(min) * 5;
        bpm = Math.floor(135 + noise + (min % 5) * 4); // Peak around 135-155
      } else if (min >= 25 && min < 40) {
        // Recovery pacing
        const noise = Math.cos(min) * 4;
        bpm = Math.floor(128 + noise); // hovering close to target
      } else {
        // Cool down
        const scale = (60 - min) / 20; // 1 to 0
        bpm = Math.floor(baseBpm + scale * 50); // cooldown back to base
      }
    } else {
      // Resting heart rate with natural heart rate variability
      const drift = Math.sin(min / 5) * 4;
      const microNoise = (min % 3 === 0 ? 2 : (min % 2 === 0 ? -1 : 0));
      bpm = Math.floor(baseBpm + drift + microNoise);
    }

    points.push({ bpm, timestamp });
  }

  return points;
};
