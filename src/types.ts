export interface UserData {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  streak: number;
  lastDungeonDate?: string;
  productivityScore: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
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
}
