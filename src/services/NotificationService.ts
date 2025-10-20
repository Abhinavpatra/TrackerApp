import PushNotification from 'react-native-push-notification';

export class NotificationService {
  static setupNotifications(): void {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
      },
      requestPermissions: true,
    });
  }

  static schedulePeriodNotification(
    notificationDate: Date, 
    notificationDays: number,
    quietMode: boolean = true
  ): void {
    // Clear existing notifications
    PushNotification.cancelAllLocalNotifications();

    // Only schedule if notification date is in the future
    if (notificationDate > new Date()) {
      PushNotification.localNotificationSchedule({
        title: "Period Reminder",
        message: `Your period is expected to start in ${notificationDays} day${notificationDays > 1 ? 's' : ''}.`,
        date: notificationDate,
        allowWhileIdle: true,
        silent: quietMode,
        soundName: quietMode ? undefined : 'default',
        vibrate: !quietMode,
      });
    }
  }

  static scheduleOvulationNotification(
    ovulationDate: Date,
    quietMode: boolean = true
  ): void {
    if (ovulationDate > new Date()) {
      PushNotification.localNotificationSchedule({
        title: "Ovulation Reminder",
        message: "You're approaching your most fertile days!",
        date: ovulationDate,
        allowWhileIdle: true,
        silent: quietMode,
        soundName: quietMode ? undefined : 'default',
        vibrate: !quietMode,
      });
    }
  }

  static cancelAllNotifications(): void {
    PushNotification.cancelAllLocalNotifications();
  }
}
