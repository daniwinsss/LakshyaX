export interface UserData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streak: number;
  lastDungeonDate?: string;
  productivityScore: number;
  friends?: string[];
  friendRequests?: string[];
  sentRequests?: string[];
}

export interface SM2Data {
  repetition: number;
  easinessFactor: number;
  interval: number;
  nextReviewDate: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  sm2Data?: SM2Data; // For spaced repetition tasks
}

export interface Quest {
  id: string;
  title: string;
  type: 'boss' | 'quest' | 'daily';
  deadline: string;
  health: number;
  maxHealth: number;
  tasks: Task[];
  rewards: { xp: number; coins: number };
  riskScore: 'low' | 'medium' | 'high';
  dependencies?: string[];
  estimatedHours?: number;
  embedding?: number[];
  sm2Data?: SM2Data;
}
