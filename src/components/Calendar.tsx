import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CalendarDay } from '../types';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 40;

interface CalendarProps {
  days: CalendarDay[];
  selectedDate: Date;
  onDatePress: (date: Date, day: CalendarDay) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  days,
  selectedDate,
  onDatePress,
  onPreviousMonth,
  onNextMonth,
}) => {
  const today = new Date();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const getDayStyle = (day: CalendarDay, isCurrentMonth: boolean) => {
    const isToday = day.date.toDateString() === today.toDateString();
    
    let backgroundColor = 'transparent';
    let borderRadius = 8;
    
    if (day.isPeriod) {
      backgroundColor = COLORS.period;
      borderRadius = 20;
    } else if (day.isPredictedPeriod) {
      backgroundColor = COLORS.predictedPeriod;
      borderRadius = 20;
    } else if (day.isPeakFertility) {
      backgroundColor = COLORS.peakFertility;
      borderRadius = 20;
    } else if (day.isOvulation) {
      backgroundColor = COLORS.ovulation;
      borderRadius = 20;
    } else if (day.isFertile) {
      backgroundColor = COLORS.fertile;
      borderRadius = 20;
    } else if (day.isNotification) {
      backgroundColor = COLORS.notification;
    }
    
    if (isToday) {
      backgroundColor = COLORS.background;
    }

    return {
      backgroundColor,
      borderRadius,
      borderWidth: isToday ? 2 : 0,
      borderColor: isToday ? COLORS.primary : 'transparent',
    };
  };

  const getTextColor = (day: CalendarDay, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return COLORS.accent;
    if (day.isPeriod || day.isPredictedPeriod || day.isPeakFertility || day.isOvulation) {
      return COLORS.white;
    }
    if (day.date.toDateString() === today.toDateString()) {
      return COLORS.primary;
    }
    return COLORS.secondary;
  };

  const getConceptionIndicator = (day: CalendarDay) => {
    if (!day.conceptionLikelihood) return null;
    
    const colors = {
      'high': COLORS.highFertility,
      'medium': COLORS.mediumFertility,
      'low': COLORS.lowFertility,
      'very-low': COLORS.veryLowFertility,
    };
    
    return (
      <View style={[
        styles.conceptionIndicator,
        { backgroundColor: colors[day.conceptionLikelihood] }
      ]} />
    );
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={onPreviousMonth}>
          <Text style={styles.calendarNavButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={onNextMonth}>
          <Text style={styles.calendarNavButton}>›</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.calendarWeekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.calendarWeekday}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          const isCurrentMonth = day.date.getMonth() === month;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarDay,
                getDayStyle(day, isCurrentMonth),
                !isCurrentMonth && styles.calendarDayOtherMonth,
              ]}
              onPress={() => onDatePress(day.date, day)}
            >
              <Text style={[
                styles.calendarDayText,
                { color: getTextColor(day, isCurrentMonth) },
                !isCurrentMonth && styles.calendarDayTextOtherMonth,
              ]}>
                {day.date.getDate()}
              </Text>
              {day.isNotification && <View style={styles.notificationDot} />}
              {getConceptionIndicator(day)}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: COLORS.secondary,
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
    color: COLORS.primary,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
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
    color: COLORS.accent,
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
    marginVertical: 2,
    position: 'relative',
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  calendarDayTextOtherMonth: {
    color: COLORS.accent,
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
  conceptionIndicator: {
    position: 'absolute',
    bottom: 2,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
