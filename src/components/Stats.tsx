import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PeriodCycle, CycleSettings } from '../types';
import { CycleCalculator } from '../services/CycleCalculator';
import { COLORS } from '../constants';

interface StatsProps {
  cycles: PeriodCycle[];
  settings: CycleSettings;
}

export const Stats: React.FC<StatsProps> = ({ cycles, settings }) => {
  const nextPeriod = cycles.length > 0 
    ? CycleCalculator.calculateNextPeriodDate(cycles[0], settings.averageCycleLength)
    : null;
  
  const nextOvulation = cycles.length > 0 
    ? CycleCalculator.calculateNextOvulationDate(cycles[0], settings.averageCycleLength)
    : null;

  const daysUntilPeriod = nextPeriod ? 
    Math.ceil((nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  const daysUntilOvulation = nextOvulation ? 
    Math.ceil((nextOvulation.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

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
          <Text style={styles.statLabel}>Days Until Period</Text>
        </View>
      )}
      {daysUntilOvulation !== null && (
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{daysUntilOvulation}</Text>
          <Text style={styles.statLabel}>Days Until Ovulation</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: COLORS.secondary,
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
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.accent,
    textAlign: 'center',
  },
});
