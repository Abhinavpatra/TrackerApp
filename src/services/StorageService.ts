import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodCycle, CycleSettings } from '../types';

const STORAGE_KEYS = {
  PERIOD_CYCLES: 'periodCycles',
  CYCLE_SETTINGS: 'cycleSettings',
};

export class StorageService {
  static async saveCycles(cycles: PeriodCycle[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PERIOD_CYCLES, JSON.stringify(cycles));
    } catch (error) {
      console.error('Error saving cycles:', error);
      throw new Error('Failed to save cycles');
    }
  }

  static async loadCycles(): Promise<PeriodCycle[]> {
    try {
      const storedCycles = await AsyncStorage.getItem(STORAGE_KEYS.PERIOD_CYCLES);
      return storedCycles ? JSON.parse(storedCycles) : [];
    } catch (error) {
      console.error('Error loading cycles:', error);
      return [];
    }
  }

  static async saveSettings(settings: CycleSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CYCLE_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  static async loadSettings(): Promise<CycleSettings | null> {
    try {
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.CYCLE_SETTINGS);
      return storedSettings ? JSON.parse(storedSettings) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PERIOD_CYCLES,
        STORAGE_KEYS.CYCLE_SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  }
}
