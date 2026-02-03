import { useState, useEffect, useCallback, useRef } from 'react';
import { StudyReminder, Subject, SUBJECTS } from '@/types/study';
import { toast } from 'sonner';

const STORAGE_KEY = 'studytrack_reminders';

export function useReminders() {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckedRef = useRef<string>('');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setReminders(JSON.parse(stored));
    }
    setIsLoaded(true);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  // Request notification permission
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

  // Send notification
  const sendNotification = useCallback((reminder: StudyReminder) => {
    if (notificationPermission !== 'granted') return;

    const subject = reminder.subject === 'any' 
      ? null 
      : SUBJECTS.find(s => s.id === reminder.subject);

    const title = subject 
      ? `📚 Time to study ${subject.name}!`
      : '📚 Study Reminder!';

    const body = reminder.message || 'Time to start your study session!';

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: reminder.id,
      });
    }

    // Also show toast for in-app notification
    toast.info(title, {
      description: body,
      duration: 10000,
    });
  }, [notificationPermission]);

  // Check reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();
      
      // Avoid checking the same minute twice
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

    // Check immediately
    checkReminders();

    // Check every 30 seconds (to catch the minute change)
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reminders, sendNotification]);

  // Add reminder
  const addReminder = useCallback((reminder: Omit<StudyReminder, 'id' | 'createdAt'>) => {
    const newReminder: StudyReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, newReminder]);
    return newReminder;
  }, []);

  // Update reminder
  const updateReminder = useCallback((id: string, updates: Partial<StudyReminder>) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  // Delete reminder
  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Toggle reminder enabled
  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }, []);

  // Clear all reminders
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
