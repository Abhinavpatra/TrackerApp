/**
 * Period Tracker App
 * A comprehensive React Native app for tracking menstrual cycles and fertility
 * Works completely offline with local data storage
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
} from 'react-native';

// Import our modular components and services
import { Calendar } from './src/components/Calendar';
import { Stats } from './src/components/Stats';
import { Settings } from './src/screens/Settings';
import { StorageService } from './src/services/StorageService';
import { CycleCalculator } from './src/services/CycleCalculator';
import { NotificationService } from './src/services/NotificationService';
import { PeriodCycle, CycleSettings, CalendarDay } from './src/types';
import { COLORS, DEFAULT_SETTINGS } from './src/constants';

function App() {
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [settings, setSettings] = useState<CycleSettings>({
    ...DEFAULT_SETTINGS,
    lastUpdated: new Date().toISOString(),
  });
  const [currentView, setCurrentView] = useState<'calendar' | 'settings'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Load data from storage on app start
  useEffect(() => {
    loadData();
    NotificationService.setupNotifications();
  }, []);

  // Update calendar when cycles or settings change
  useEffect(() => {
    updateCalendar();
  }, [cycles, settings, selectedDate]);

  // Setup notifications when cycles change
  useEffect(() => {
    if (cycles.length > 0) {
      scheduleNotifications();
    }
  }, [cycles, settings]);

  const loadData = async () => {
    try {
      const [loadedCycles, loadedSettings] = await Promise.all([
        StorageService.loadCycles(),
        StorageService.loadSettings(),
      ]);
      
      setCycles(loadedCycles);
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const saveCycles = async (newCycles: PeriodCycle[]) => {
    try {
      await StorageService.saveCycles(newCycles);
      setCycles(newCycles);
    } catch (error) {
      console.error('Error saving cycles:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const saveSettings = async (newSettings: CycleSettings) => {
    try {
      await StorageService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateCalendar = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const days = CycleCalculator.generateCalendarDays(year, month, cycles, settings);
    setCalendarDays(days);
  };

  const scheduleNotifications = () => {
    if (cycles.length === 0) return;

    const lastCycle = cycles[0];
    const nextPeriod = CycleCalculator.calculateNextPeriodDate(lastCycle, settings.averageCycleLength);
    const nextOvulation = CycleCalculator.calculateNextOvulationDate(lastCycle, settings.averageCycleLength);

    // Schedule period notification
    const periodNotificationDate = new Date(nextPeriod);
    periodNotificationDate.setDate(periodNotificationDate.getDate() - settings.notificationDays);
    NotificationService.schedulePeriodNotification(
      periodNotificationDate,
      settings.notificationDays,
      settings.quietNotifications
    );

    // Schedule ovulation notification
    NotificationService.scheduleOvulationNotification(
      nextOvulation,
      settings.quietNotifications
    );
  };

  const addPeriodCycle = (startDate: Date, endDate: Date) => {
    const periodLength = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate cycle length from previous cycle
    let cycleLength = settings.averageCycleLength;
    if (cycles.length > 0) {
      const lastCycle = cycles[0];
      const lastStartDate = new Date(lastCycle.startDate);
      cycleLength = Math.ceil((startDate.getTime() - lastStartDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const newCycle: PeriodCycle = {
      id: Date.now().toString(),
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      cycleLength,
      periodLength,
    };

    const updatedCycles = [newCycle, ...cycles];
    saveCycles(updatedCycles);

    // Update average cycle length
    const { avgCycleLength, avgPeriodLength } = CycleCalculator.updateCycleAverages(updatedCycles);
    const updatedSettings = {
      ...settings,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      lastUpdated: new Date().toISOString(),
    };
    saveSettings(updatedSettings);
  };

  const modifyPeriodCycle = (cycleId: string, newStartDate: Date, newEndDate: Date) => {
    const periodLength = Math.ceil((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const updatedCycles = cycles.map(cycle => {
      if (cycle.id === cycleId) {
        return {
          ...cycle,
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0],
          periodLength,
        };
      }
      return cycle;
    });

    saveCycles(updatedCycles);
    
    // Update averages
    const { avgCycleLength, avgPeriodLength } = CycleCalculator.updateCycleAverages(updatedCycles);
    const updatedSettings = {
      ...settings,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      lastUpdated: new Date().toISOString(),
    };
    saveSettings(updatedSettings);
  };

  const startNewPeriod = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + settings.averagePeriodLength - 1);
    
    Alert.alert(
      'Confirm Period',
      `Period will be from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. Is this correct?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => addPeriodCycle(startDate, endDate) },
      ]
    );
  };

  const modifyPeriodEnd = (cycleId: string, newEndDate: Date) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return;

    const startDate = new Date(cycle.startDate);
    modifyPeriodCycle(cycleId, startDate, newEndDate);
    
    Alert.alert('Period Modified', 'Period end date has been updated');
  };

  const extendPeriod = (cycleId: string, newEndDate: Date) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return;

    const startDate = new Date(cycle.startDate);
    modifyPeriodCycle(cycleId, startDate, newEndDate);
    
    Alert.alert('Period Extended', 'Period has been extended');
  };

  const handleDatePress = (date: Date, day: CalendarDay) => {
    if (day.isPeriod) {
      // Find the cycle for this date
      const cycleForDate = cycles.find(cycle => {
        const dateStr = date.toISOString().split('T')[0];
        return dateStr >= cycle.startDate && dateStr <= cycle.endDate;
      });
      
      if (cycleForDate) {
        Alert.alert('Modify Period', 'What would you like to do?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'End Early', onPress: () => modifyPeriodEnd(cycleForDate.id, date) },
          { text: 'Extend', onPress: () => extendPeriod(cycleForDate.id, date) },
        ]);
      }
    } else if (day.isPredictedPeriod) {
      Alert.alert('Predicted Period', 'Your period is predicted to start around this time');
    } else if (day.isOvulation) {
      Alert.alert('Ovulation Day', 'You are most fertile today!');
    } else if (day.isPeakFertility) {
      Alert.alert('Peak Fertility', 'This is your peak fertility day');
    } else if (day.isFertile) {
      Alert.alert('Fertile Window', 'You are in your fertile window');
    } else if (day.isNotification) {
      Alert.alert('Reminder', 'Your period is expected in 1-2 days');
    } else {
      Alert.alert('Add Period', 'Would you like to start a new period cycle?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Period', onPress: () => startNewPeriod(date) },
      ]);
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setSelectedDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setSelectedDate(nextMonth);
  };

  const handleSettingsChange = (newSettings: CycleSettings) => {
    saveSettings(newSettings);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Period Tracker</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.headerButton, currentView === 'calendar' && styles.headerButtonActive]}
              onPress={() => setCurrentView('calendar')}
            >
              <Text style={[styles.headerButtonText, currentView === 'calendar' && styles.headerButtonTextActive]}>
                Calendar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, currentView === 'settings' && styles.headerButtonActive]}
              onPress={() => setCurrentView('settings')}
            >
              <Text style={[styles.headerButtonText, currentView === 'settings' && styles.headerButtonTextActive]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {currentView === 'calendar' && (
            <>
              <Stats cycles={cycles} settings={settings} />
              <Calendar
                days={calendarDays}
                selectedDate={selectedDate}
                onDatePress={handleDatePress}
                onPreviousMonth={handlePreviousMonth}
                onNextMonth={handleNextMonth}
              />
            </>
          )}
          
          {currentView === 'settings' && (
            <Settings
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: '#d4e6d4',
  },
  headerButtonActive: {
    backgroundColor: COLORS.primary,
  },
  headerButtonText: {
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  headerButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
});

export default App;