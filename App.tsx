/**
 * Period Tracker App
 * A React Native app for tracking menstrual cycles
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
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

interface PeriodCycle {
  id: string;
  startDate: string;
  endDate: string;
  cycleLength: number;
  periodLength: number;
  notes?: string;
}

interface CycleSettings {
  averageCycleLength: number;
  averagePeriodLength: number;
  notificationDays: number;
  lastUpdated: string;
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40;

function App() {
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [settings, setSettings] = useState<CycleSettings>({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    notificationDays: 2,
    lastUpdated: new Date().toISOString(),
  });
  const [currentView, setCurrentView] = useState<'calendar' | 'settings' | 'history'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load data from storage on app start
  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  // Setup notifications when cycles change
  useEffect(() => {
    if (cycles.length > 0) {
      schedulePeriodNotifications();
    }
  }, [cycles, settings]);

  const loadData = async () => {
    try {
      const storedCycles = await AsyncStorage.getItem('periodCycles');
      const storedSettings = await AsyncStorage.getItem('cycleSettings');
      
      if (storedCycles) {
        setCycles(JSON.parse(storedCycles));
      }
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveCycles = async (newCycles: PeriodCycle[]) => {
    try {
      await AsyncStorage.setItem('periodCycles', JSON.stringify(newCycles));
    } catch (error) {
      console.error('Error saving cycles:', error);
      Alert.alert('Error', 'Failed to save data');
    }
  };

  const saveSettings = async (newSettings: CycleSettings) => {
    try {
      await AsyncStorage.setItem('cycleSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const setupNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
      },
      requestPermissions: true,
    });
  };

  const schedulePeriodNotifications = () => {
    // Clear existing notifications
    PushNotification.cancelAllLocalNotifications();

    const nextPeriod = getNextPeriodDate();
    if (!nextPeriod) return;

    // Schedule notification 1-2 days before period
    const notificationDate = new Date(nextPeriod);
    notificationDate.setDate(notificationDate.getDate() - settings.notificationDays);

    // Only schedule if notification date is in the future
    if (notificationDate > new Date()) {
      PushNotification.localNotificationSchedule({
        title: "Period Reminder",
        message: `Your period is expected to start in ${settings.notificationDays} day${settings.notificationDays > 1 ? 's' : ''}.`,
        date: notificationDate,
        allowWhileIdle: true,
      });
    }
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
    setCycles(updatedCycles);
    saveCycles(updatedCycles);

    // Update average cycle length
    updateCycleAverages(updatedCycles);
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

    setCycles(updatedCycles);
    saveCycles(updatedCycles);
    updateCycleAverages(updatedCycles);
  };

  const updateCycleAverages = (cycleList: PeriodCycle[]) => {
    const totalCycles = cycleList.length;
    const avgCycleLength = Math.round(
      cycleList.reduce((sum, cycle) => sum + cycle.cycleLength, 0) / totalCycles
    );
    const avgPeriodLength = Math.round(
      cycleList.reduce((sum, cycle) => sum + cycle.periodLength, 0) / totalCycles
    );

    const updatedSettings = {
      ...settings,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      lastUpdated: new Date().toISOString(),
    };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  const getNextPeriodDate = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[0];
    const lastStartDate = new Date(lastCycle.startDate);
    const nextStartDate = new Date(lastStartDate);
    nextStartDate.setDate(nextStartDate.getDate() + settings.averageCycleLength);
    
    return nextStartDate;
  };

  const getPeriodEndDate = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[0];
    const lastEndDate = new Date(lastCycle.endDate);
    const nextEndDate = new Date(lastEndDate);
    nextEndDate.setDate(nextEndDate.getDate() + settings.averageCycleLength);
    
    return nextEndDate;
  };

  const isDateInPeriod = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cycles.some(cycle => 
      dateStr >= cycle.startDate && dateStr <= cycle.endDate
    );
  };

  const isDatePredictedPeriod = (date: Date) => {
    const nextPeriod = getNextPeriodDate();
    const nextEnd = getPeriodEndDate();
    if (!nextPeriod || !nextEnd) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    const nextStartStr = nextPeriod.toISOString().split('T')[0];
    const nextEndStr = nextEnd.toISOString().split('T')[0];
    
    return dateStr >= nextStartStr && dateStr <= nextEndStr;
  };

  const isDateNotificationDay = (date: Date) => {
    const nextPeriod = getNextPeriodDate();
    if (!nextPeriod) return false;
    
    const notificationDate = new Date(nextPeriod);
    notificationDate.setDate(notificationDate.getDate() - settings.notificationDays);
    
    const dateStr = date.toISOString().split('T')[0];
    const notificationStr = notificationDate.toISOString().split('T')[0];
    
    return dateStr === notificationStr;
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isPeriod = isDateInPeriod(currentDate);
      const isPredicted = isDatePredictedPeriod(currentDate);
      const isNotification = isDateNotificationDay(currentDate);
      
      days.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.calendarDay,
            !isCurrentMonth && styles.calendarDayOtherMonth,
            isToday && styles.calendarDayToday,
            isPeriod && styles.calendarDayPeriod,
            isPredicted && styles.calendarDayPredicted,
            isNotification && styles.calendarDayNotification,
          ]}
          onPress={() => {
            if (isCurrentMonth) {
              if (isPeriod) {
                // Find the cycle for this date
                const cycleForDate = cycles.find(cycle => {
                  const dateStr = currentDate.toISOString().split('T')[0];
                  return dateStr >= cycle.startDate && dateStr <= cycle.endDate;
                });
                
                if (cycleForDate) {
                  Alert.alert('Modify Period', 'What would you like to do?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'End Early', onPress: () => modifyPeriodEnd(cycleForDate.id, currentDate) },
                    { text: 'Extend', onPress: () => extendPeriod(cycleForDate.id, currentDate) },
                  ]);
                }
              } else if (isPredicted) {
                Alert.alert('Predicted Period', 'Your period is predicted to start around this time');
              } else if (isNotification) {
                Alert.alert('Reminder', 'Your period is expected in 1-2 days');
              } else {
                Alert.alert('Add Period', 'Would you like to start a new period cycle?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Start Period', onPress: () => startNewPeriod(currentDate) },
                ]);
              }
            }
          }}
        >
          <Text style={[
            styles.calendarDayText,
            !isCurrentMonth && styles.calendarDayTextOtherMonth,
            isToday && styles.calendarDayTextToday,
            (isPeriod || isPredicted) && styles.calendarDayTextPeriod,
          ]}>
            {currentDate.getDate()}
          </Text>
          {isNotification && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      );
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => {
            const prevMonth = new Date(selectedDate);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            setSelectedDate(prevMonth);
          }}>
            <Text style={styles.calendarNavButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => {
            const nextMonth = new Date(selectedDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            setSelectedDate(nextMonth);
          }}>
            <Text style={styles.calendarNavButton}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.calendarWeekdays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.calendarWeekday}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {days}
        </View>
      </View>
    );
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

  const renderStats = () => {
    const nextPeriod = getNextPeriodDate();
    const daysUntilPeriod = nextPeriod ? 
      Math.ceil((nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{settings.averageCycleLength}</Text>
          <Text style={styles.statLabel}>Avg Cycle Length</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{settings.averagePeriodLength}</Text>
          <Text style={styles.statLabel}>Avg Period Length</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{cycles.length}</Text>
          <Text style={styles.statLabel}>Cycles Tracked</Text>
        </View>
        {daysUntilPeriod !== null && (
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{daysUntilPeriod}</Text>
            <Text style={styles.statLabel}>Days Until Next</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8f0" />
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
              {renderStats()}
              {renderCalendar()}
            </>
          )}
          
          {currentView === 'settings' && (
            <View style={styles.settingsContainer}>
              <Text style={styles.settingsTitle}>Cycle Settings</Text>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Average Cycle Length: {settings.averageCycleLength} days</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Average Period Length: {settings.averagePeriodLength} days</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Notification Days Before: {settings.notificationDays}</Text>
              </View>
              <Text style={styles.settingsNote}>
                These values are automatically calculated based on your tracked cycles.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
    shadowColor: '#2d5a2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a2d',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    borderWidth: 1,
    borderColor: '#d4e6d4',
  },
  headerButtonActive: {
    backgroundColor: '#4a7c59',
  },
  headerButtonText: {
    color: '#2d5a2d',
    fontWeight: '600',
    fontSize: 14,
  },
  headerButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#2d5a2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a7c59',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b8e6b',
    textAlign: 'center',
  },
  calendar: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#2d5a2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    fontSize: 24,
    color: '#4a7c59',
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d5a2d',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b8e6b',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: CALENDAR_WIDTH / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
    position: 'relative',
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
    borderColor: '#4a7c59',
  },
  calendarDayPeriod: {
    backgroundColor: '#ff6b6b',
    borderRadius: 20,
  },
  calendarDayPredicted: {
    backgroundColor: '#ffb3ba',
    borderRadius: 20,
  },
  calendarDayNotification: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#2d5a2d',
    fontWeight: '500',
  },
  calendarDayTextOtherMonth: {
    color: '#a0c0a0',
  },
  calendarDayTextToday: {
    color: '#4a7c59',
    fontWeight: 'bold',
  },
  calendarDayTextPeriod: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffc107',
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#2d5a2d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5a2d',
    marginBottom: 20,
  },
  settingItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
  },
  settingLabel: {
    fontSize: 16,
    color: '#4a7c59',
    fontWeight: '500',
  },
  settingsNote: {
    fontSize: 14,
    color: '#6b8e6b',
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default App;
