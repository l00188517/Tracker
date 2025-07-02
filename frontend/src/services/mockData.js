// Mock data service for frontend-only development
const STORAGE_KEYS = {
  HABITS: 'habits-tracker-habits',
  COMPLETIONS: 'habits-tracker-completions',
  SETTINGS: 'habits-tracker-settings'
};

// Categories for habits
export const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: '💪' },
  { id: 'productivity', name: 'Productivity', color: '#3b82f6', icon: '📈' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#8b5cf6', icon: '🧘' },
  { id: 'learning', name: 'Learning', color: '#f59e0b', icon: '📚' },
  { id: 'social', name: 'Social', color: '#ef4444', icon: '👥' },
  { id: 'creativity', name: 'Creativity', color: '#ec4899', icon: '🎨' },
  { id: 'habits', name: 'Daily Habits', color: '#06b6d4', icon: '⭐' }
];

// Time slots for habits
export const TIME_SLOTS = [
  { id: 'morning', name: 'Morning', icon: '🌅' },
  { id: 'afternoon', name: 'Afternoon', icon: '☀️' },
  { id: 'evening', name: 'Evening', icon: '🌆' },
  { id: 'night', name: 'Night', icon: '🌙' },
  { id: 'anytime', name: 'Anytime', icon: '⏰' }
];

// Frequency options
export const FREQUENCY_OPTIONS = [
  { id: 'daily', name: 'Daily', icon: '📅' },
  { id: 'weekly', name: 'Weekly', icon: '📆' },
  { id: 'custom', name: 'Custom', icon: '⚙️' }
];

// Mock habits data
const mockHabits = [
  {
    id: '1',
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    timeSlot: 'anytime',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6], // All days
    streak: 7,
    bestStreak: 15,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    reminderTime: '09:00',
    reminderEnabled: true
  },
  {
    id: '2',
    name: 'Morning Exercise',
    description: '30 minutes of physical activity',
    category: 'health',
    timeSlot: 'morning',
    frequency: 'daily',
    targetDays: [1, 2, 3, 4, 5], // Weekdays
    streak: 3,
    bestStreak: 12,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    reminderTime: '07:00',
    reminderEnabled: true
  },
  {
    id: '3',
    name: 'Read for 30 minutes',
    description: 'Read books or articles to expand knowledge',
    category: 'learning',
    timeSlot: 'evening',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    streak: 5,
    bestStreak: 20,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    reminderTime: '20:00',
    reminderEnabled: false
  },
  {
    id: '4',
    name: 'Meditation',
    description: '10 minutes of mindfulness meditation',
    category: 'mindfulness',
    timeSlot: 'morning',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    streak: 2,
    bestStreak: 8,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    reminderTime: '06:30',
    reminderEnabled: true
  },
  {
    id: '5',
    name: 'Write in Journal',
    description: 'Daily reflection and gratitude practice',
    category: 'mindfulness',
    timeSlot: 'night',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    streak: 1,
    bestStreak: 5,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    reminderTime: '22:00',
    reminderEnabled: true
  }
];

// Mock completions data (last 30 days)
const generateMockCompletions = () => {
  const completions = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    mockHabits.forEach(habit => {
      // Simulate realistic completion patterns
      const shouldComplete = Math.random() > 0.3; // 70% completion rate
      
      if (shouldComplete) {
        completions.push({
          id: `${habit.id}-${dateStr}`,
          habitId: habit.id,
          date: dateStr,
          completed: true,
          completedAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          note: i % 5 === 0 ? 'Felt great today!' : null
        });
      }
    });
  }
  
  return completions;
};

class MockDataService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Initialize with mock data if not present
    if (!localStorage.getItem(STORAGE_KEYS.HABITS)) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(mockHabits));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.COMPLETIONS)) {
      localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(generateMockCompletions()));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        theme: 'light',
        notifications: true,
        weekStartsOn: 1, // Monday
        timeFormat: '24h'
      }));
    }
  }

  // Habits CRUD
  async getHabits() {
    return new Promise(resolve => {
      setTimeout(() => {
        const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
        resolve(habits.filter(h => h.isActive));
      }, 100);
    });
  }

  async createHabit(habitData) {
    return new Promise(resolve => {
      setTimeout(() => {
        const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
        const newHabit = {
          ...habitData,
          id: Date.now().toString(),
          streak: 0,
          bestStreak: 0,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        habits.push(newHabit);
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
        resolve(newHabit);
      }, 100);
    });
  }

  async updateHabit(habitId, updates) {
    return new Promise(resolve => {
      setTimeout(() => {
        const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex !== -1) {
          habits[habitIndex] = { ...habits[habitIndex], ...updates };
          localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
          resolve(habits[habitIndex]);
        }
        resolve(null);
      }, 100);
    });
  }

  async deleteHabit(habitId) {
    return new Promise(resolve => {
      setTimeout(() => {
        const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
        const updatedHabits = habits.map(h => 
          h.id === habitId ? { ...h, isActive: false } : h
        );
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(updatedHabits));
        resolve(true);
      }, 100);
    });
  }

  // Completions
  async getCompletions(startDate, endDate) {
    return new Promise(resolve => {
      setTimeout(() => {
        const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
        const filtered = completions.filter(c => 
          c.date >= startDate && c.date <= endDate
        );
        resolve(filtered);
      }, 100);
    });
  }

  async toggleHabitCompletion(habitId, date, note = null) {
    return new Promise(resolve => {
      setTimeout(() => {
        const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
        const completionId = `${habitId}-${date}`;
        const existingIndex = completions.findIndex(c => c.id === completionId);
        
        if (existingIndex !== -1) {
          // Remove completion
          completions.splice(existingIndex, 1);
          this.updateHabitStreak(habitId);
          localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
          resolve({ completed: false });
        } else {
          // Add completion
          const completion = {
            id: completionId,
            habitId,
            date,
            completed: true,
            completedAt: new Date().toISOString(),
            note
          };
          completions.push(completion);
          this.updateHabitStreak(habitId);
          localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
          resolve({ completed: true, completion });
        }
      }, 100);
    });
  }

  updateHabitStreak(habitId) {
    const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
    const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
    
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const habitCompletions = completions
      .filter(c => c.habitId === habitId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate current streak
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayOfWeek = checkDate.getDay();
      const isTargetDay = habit.targetDays.includes(dayOfWeek);
      
      if (!isTargetDay) continue;
      
      const hasCompletion = habitCompletions.some(c => c.date === dateStr);
      if (hasCompletion) {
        streak++;
      } else {
        break;
      }
    }

    // Update habit
    habits[habitIndex].streak = streak;
    habits[habitIndex].bestStreak = Math.max(habit.bestStreak, streak);
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  // Settings
  async getSettings() {
    return new Promise(resolve => {
      setTimeout(() => {
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        resolve(settings);
      }, 50);
    });
  }

  async updateSettings(updates) {
    return new Promise(resolve => {
      setTimeout(() => {
        const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
        const updatedSettings = { ...settings, ...updates };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
        resolve(updatedSettings);
      }, 50);
    });
  }

  // Analytics
  async getHabitStats(habitId, days = 30) {
    return new Promise(resolve => {
      setTimeout(() => {
        const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
        const habits = JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS) || '[]');
        
        const habit = habits.find(h => h.id === habitId);
        if (!habit) {
          resolve(null);
          return;
        }

        const habitCompletions = completions.filter(c => c.habitId === habitId);
        const totalDays = days;
        const completedDays = habitCompletions.length;
        const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

        resolve({
          habitId,
          totalDays,
          completedDays,
          completionRate,
          currentStreak: habit.streak,
          bestStreak: habit.bestStreak,
          completions: habitCompletions
        });
      }, 100);
    });
  }
}

export const mockDataService = new MockDataService();
export default mockDataService;