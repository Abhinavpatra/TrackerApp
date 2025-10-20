export interface PeriodCycle {
  id: string;
  startDate: string;
  endDate: string;
  cycleLength: number;
  periodLength: number;
  notes?: string;
}

export interface CycleSettings {
  averageCycleLength: number;
  averagePeriodLength: number;
  ovulationLength: number;
  notificationDays: number;
  quietNotifications: boolean;
  lastUpdated: string;
}

export interface FertilityWindow {
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  peakFertility: Date;
  conceptionLikelihood: 'high' | 'medium' | 'low' | 'very-low';
}

export interface CalendarDay {
  date: Date;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPeakFertility: boolean;
  isNotification: boolean;
  conceptionLikelihood: 'high' | 'medium' | 'low' | 'very-low' | null;
}
