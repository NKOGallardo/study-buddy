import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyReminder } from '@/types/study';
import { toast } from 'sonner';

const STORAGE_KEY = 'studytrack_reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setReminders(JSON.parse(stored));
    }
    setIsLoaded(true);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast.success('Notification permission granted!');
      return true;
    } else {
      toast.error('Notification permission denied');
      return false;
    }
  }, []);

  const sendNotification = useCallback(
    (reminder: StudyReminder) => {
      if (notificationPermission !== 'granted') return;

      const title =
        reminder.subject === 'any'
          ? '📚 Study Reminder!'
          : `📚 Time to study ${reminder.subject}!`;

      const body = reminder.message || 'Time to start your study session!';

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: reminder.id,
        });
      }

      toast.info(title, { description: body, duration: 10000 });
    },
    [notificationPermission]
  );

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      const currentDay = now.getDay();

      const checkKey = `${currentTime}-${currentDay}`;
      if (lastCheckedRef.current === checkKey) return;
      lastCheckedRef.current = checkKey;

      reminders.forEach((reminder) => {
        if (
          reminder.enabled &&
          reminder.time === currentTime &&
          reminder.days.includes(currentDay)
        ) {
          sendNotification(reminder);
        }
      });
    };

    checkReminders();
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminders, sendNotification]);

  const addReminder = useCallback((reminder: Omit<StudyReminder, 'id' | 'createdAt'>) => {
    const newReminder: StudyReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, newReminder]);
    return newReminder;
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<StudyReminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const clearAllReminders = useCallback(() => {
    setReminders([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    reminders,
    isLoaded,
    notificationPermission,
    requestPermission,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    clearAllReminders,
  };
}
