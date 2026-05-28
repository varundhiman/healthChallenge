export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  healthProvider: 'google' | 'apple' | null;
  sharedData: {
    heartRate: boolean;
    steps: boolean;
    sleep: boolean;
  };
  points: number;
}

export type ChallengeIntervalType = 'hourly' | 'daily' | 'weekly';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetBpm: number;
  durationMinutes: number; // e.g., 5 minutes
  intervalType: ChallengeIntervalType;
  groupId: string;
  creatorId: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  members: string[]; // User IDs
  challengeIds: string[];
}

export interface HeartRateSegment {
  timestamp: string; // ISO String
  bpm: number;
}

// Track full day accomplishment for each challenge, particularly the hourly one
export interface ChallengeProgress {
  userId: string;
  challengeId: string;
  date: string; // YYYY-MM-DD
  // For hourly, tracker of success status for each of 24 hours (0-23)
  hourlyTimeline: {
    [hour: number]: {
      maxBpm: number;
      durationAtTargetMinutes: number;
      success: boolean;
    };
  };
  totalCompletedHours: number;
  overallSuccess: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  score: number; // Completed hours, total minutes, or custom point logic
  rank: number;
  isCurrentUser: boolean;
}
