import { PeriodCycle, CycleSettings, FertilityWindow, CalendarDay } from '../types';
import { FERTILITY_WINDOWS } from '../constants';

export class CycleCalculator {
  static calculateOvulationDate(lastPeriodStart: Date, cycleLength: number): Date {
    const ovulationDate = new Date(lastPeriodStart);
    ovulationDate.setDate(ovulationDate.getDate() + cycleLength - 14);
    return ovulationDate;
  }

  static calculateFertilityWindow(ovulationDate: Date): FertilityWindow {
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - FERTILITY_WINDOWS.fertileDaysBeforeOvulation);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + FERTILITY_WINDOWS.fertileDaysAfterOvulation);

    const peakFertility = new Date(ovulationDate);
    peakFertility.setDate(peakFertility.getDate() - 1);

    return {
      ovulationDate,
      fertileStart,
      fertileEnd,
      peakFertility,
      conceptionLikelihood: 'high',
    };
  }

  static getConceptionLikelihood(date: Date, fertilityWindow: FertilityWindow): 'high' | 'medium' | 'low' | 'very-low' {
    const dateStr = date.toISOString().split('T')[0];
    const ovulationStr = fertilityWindow.ovulationDate.toISOString().split('T')[0];
    const peakStr = fertilityWindow.peakFertility.toISOString().split('T')[0];
    const fertileStartStr = fertilityWindow.fertileStart.toISOString().split('T')[0];
    const fertileEndStr = fertilityWindow.fertileEnd.toISOString().split('T')[0];

    if (dateStr === ovulationStr || dateStr === peakStr) {
      return 'high';
    }
    if (dateStr >= fertileStartStr && dateStr <= fertileEndStr) {
      return 'medium';
    }
    
    // Calculate distance from ovulation
    const daysFromOvulation = Math.abs(
      Math.ceil((date.getTime() - fertilityWindow.ovulationDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    if (daysFromOvulation <= 3) {
      return 'low';
    }
    return 'very-low';
  }

  static calculateNextPeriodDate(lastCycle: PeriodCycle, averageCycleLength: number): Date {
    const lastStartDate = new Date(lastCycle.startDate);
    const nextStartDate = new Date(lastStartDate);
    nextStartDate.setDate(nextStartDate.getDate() + averageCycleLength);
    return nextStartDate;
  }

  static calculateNextOvulationDate(lastCycle: PeriodCycle, averageCycleLength: number): Date {
    const nextPeriodDate = this.calculateNextPeriodDate(lastCycle, averageCycleLength);
    return this.calculateOvulationDate(nextPeriodDate, averageCycleLength);
  }

  static updateCycleAverages(cycles: PeriodCycle[]): { avgCycleLength: number; avgPeriodLength: number } {
    if (cycles.length === 0) return { avgCycleLength: 28, avgPeriodLength: 3 };

    const totalCycles = cycles.length;
    const avgCycleLength = Math.round(
      cycles.reduce((sum, cycle) => sum + cycle.cycleLength, 0) / totalCycles
    );
    const avgPeriodLength = Math.round(
      cycles.reduce((sum, cycle) => sum + cycle.periodLength, 0) / totalCycles
    );

    return { avgCycleLength, avgPeriodLength };
  }

  static generateCalendarDays(
    year: number,
    month: number,
    cycles: PeriodCycle[],
    settings: CycleSettings
  ): CalendarDay[] {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const isPeriod = this.isDateInPeriod(currentDate, cycles);
      const isPredictedPeriod = this.isDatePredictedPeriod(currentDate, cycles, settings);
      const isOvulation = this.isDateOvulation(currentDate, cycles, settings);
      const isFertile = this.isDateFertile(currentDate, cycles, settings);
      const isPeakFertility = this.isDatePeakFertility(currentDate, cycles, settings);
      const isNotification = this.isDateNotificationDay(currentDate, cycles, settings);
      const conceptionLikelihood = this.getConceptionLikelihoodForDate(currentDate, cycles, settings);

      days.push({
        date: new Date(currentDate),
        isPeriod,
        isPredictedPeriod,
        isOvulation,
        isFertile,
        isPeakFertility,
        isNotification,
        conceptionLikelihood,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  private static isDateInPeriod(date: Date, cycles: PeriodCycle[]): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return cycles.some(cycle => 
      dateStr >= cycle.startDate && dateStr <= cycle.endDate
    );
  }

  private static isDatePredictedPeriod(date: Date, cycles: PeriodCycle[], settings: CycleSettings): boolean {
    if (cycles.length === 0) return false;
    
    const lastCycle = cycles[0];
    const nextPeriod = this.calculateNextPeriodDate(lastCycle, settings.averageCycleLength);
    const nextEnd = new Date(nextPeriod);
    nextEnd.setDate(nextEnd.getDate() + settings.averagePeriodLength - 1);
    
    const dateStr = date.toISOString().split('T')[0];
    const nextStartStr = nextPeriod.toISOString().split('T')[0];
    const nextEndStr = nextEnd.toISOString().split('T')[0];
    
    return dateStr >= nextStartStr && dateStr <= nextEndStr;
  }

  private static isDateOvulation(date: Date, cycles: PeriodCycle[], settings: CycleSettings): boolean {
    if (cycles.length === 0) return false;
    
    const lastCycle = cycles[0];
    const nextOvulation = this.calculateNextOvulationDate(lastCycle, settings.averageCycleLength);
    
    const dateStr = date.toISOString().split('T')[0];
    const ovulationStr = nextOvulation.toISOString().split('T')[0];
    
    return dateStr === ovulationStr;
  }

  private static isDateFertile(date: Date, cycles: PeriodCycle[], settings: CycleSettings): boolean {
    if (cycles.length === 0) return false;
    
    const lastCycle = cycles[0];
    const nextOvulation = this.calculateNextOvulationDate(lastCycle, settings.averageCycleLength);
    const fertilityWindow = this.calculateFertilityWindow(nextOvulation);
    
    const dateStr = date.toISOString().split('T')[0];
    const fertileStartStr = fertilityWindow.fertileStart.toISOString().split('T')[0];
    const fertileEndStr = fertilityWindow.fertileEnd.toISOString().split('T')[0];
    
    return dateStr >= fertileStartStr && dateStr <= fertileEndStr;
  }

  private static isDatePeakFertility(date: Date, cycles: PeriodCycle[], settings: CycleSettings): boolean {
    if (cycles.length === 0) return false;
    
    const lastCycle = cycles[0];
    const nextOvulation = this.calculateNextOvulationDate(lastCycle, settings.averageCycleLength);
    const fertilityWindow = this.calculateFertilityWindow(nextOvulation);
    
    const dateStr = date.toISOString().split('T')[0];
    const peakStr = fertilityWindow.peakFertility.toISOString().split('T')[0];
    
    return dateStr === peakStr;
  }

  private static isDateNotificationDay(date: Date, cycles: PeriodCycle[], settings: CycleSettings): boolean {
    if (cycles.length === 0) return false;
    
    const lastCycle = cycles[0];
    const nextPeriod = this.calculateNextPeriodDate(lastCycle, settings.averageCycleLength);
    const notificationDate = new Date(nextPeriod);
    notificationDate.setDate(notificationDate.getDate() - settings.notificationDays);
    
    const dateStr = date.toISOString().split('T')[0];
    const notificationStr = notificationDate.toISOString().split('T')[0];
    
    return dateStr === notificationStr;
  }

  private static getConceptionLikelihoodForDate(
    date: Date, 
    cycles: PeriodCycle[], 
    settings: CycleSettings
  ): 'high' | 'medium' | 'low' | 'very-low' | null {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[0];
    const nextOvulation = this.calculateNextOvulationDate(lastCycle, settings.averageCycleLength);
    const fertilityWindow = this.calculateFertilityWindow(nextOvulation);
    
    return this.getConceptionLikelihood(date, fertilityWindow);
  }
}
