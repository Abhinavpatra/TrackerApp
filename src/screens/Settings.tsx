import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { CycleSettings } from '../types';
import { COLORS } from '../constants';

interface SettingsProps {
  settings: CycleSettings;
  onSettingsChange: (settings: CycleSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSave = () => {
    if (tempSettings.averageCycleLength < 21 || tempSettings.averageCycleLength > 35) {
      Alert.alert('Invalid Cycle Length', 'Cycle length should be between 21 and 35 days');
      return;
    }
    if (tempSettings.averagePeriodLength < 1 || tempSettings.averagePeriodLength > 10) {
      Alert.alert('Invalid Period Length', 'Period length should be between 1 and 10 days');
      return;
    }
    if (tempSettings.notificationDays < 1 || tempSettings.notificationDays > 7) {
      Alert.alert('Invalid Notification Days', 'Notification days should be between 1 and 7');
      return;
    }

    const updatedSettings = {
      ...tempSettings,
      lastUpdated: new Date().toISOString(),
    };
    
    onSettingsChange(updatedSettings);
    setIsEditing(false);
    Alert.alert('Settings Saved', 'Your cycle settings have been updated');
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cycle Settings</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Average Cycle Length (days)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={tempSettings.averageCycleLength.toString()}
              onChangeText={(text) => setTempSettings({
                ...tempSettings,
                averageCycleLength: parseInt(text) || 28
              })}
              keyboardType="numeric"
              placeholder="28"
            />
          ) : (
            <Text style={styles.settingValue}>{settings.averageCycleLength}</Text>
          )}
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Average Period Length (days)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={tempSettings.averagePeriodLength.toString()}
              onChangeText={(text) => setTempSettings({
                ...tempSettings,
                averagePeriodLength: parseInt(text) || 3
              })}
              keyboardType="numeric"
              placeholder="3"
            />
          ) : (
            <Text style={styles.settingValue}>{settings.averagePeriodLength}</Text>
          )}
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Notification Days Before Period</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={tempSettings.notificationDays.toString()}
              onChangeText={(text) => setTempSettings({
                ...tempSettings,
                notificationDays: parseInt(text) || 2
              })}
              keyboardType="numeric"
              placeholder="2"
            />
          ) : (
            <Text style={styles.settingValue}>{settings.notificationDays}</Text>
          )}
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Quiet Notifications</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => isEditing && setTempSettings({
              ...tempSettings,
              quietNotifications: !tempSettings.quietNotifications
            })}
          >
            <Text style={styles.toggleButtonText}>
              {tempSettings.quietNotifications ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Fertility Information</Text>
        <Text style={styles.infoText}>
          • Ovulation typically occurs 14 days before your next period
        </Text>
        <Text style={styles.infoText}>
          • Fertile window is 5 days before ovulation + 1 day after
        </Text>
        <Text style={styles.infoText}>
          • Peak fertility is 1-2 days before ovulation
        </Text>
        <Text style={styles.infoText}>
          • Conception likelihood decreases after ovulation
        </Text>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Calendar Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.period }]} />
          <Text style={styles.legendText}>Period Days</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.predictedPeriod }]} />
          <Text style={styles.legendText}>Predicted Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.ovulation }]} />
          <Text style={styles.legendText}>Ovulation Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.peakFertility }]} />
          <Text style={styles.legendText}>Peak Fertility</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.fertile }]} />
          <Text style={styles.legendText}>Fertile Window</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.notification }]} />
          <Text style={styles.legendText}>Notification Day</Text>
        </View>
      </View>
    </ScrollView>
  );
};

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  settingsContainer: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: '500',
    marginBottom: 10,
  },
  settingValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
  },
  toggleButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.accent,
    marginBottom: 8,
  },
  legendContainer: {
    backgroundColor: COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.accent,
  },
});

