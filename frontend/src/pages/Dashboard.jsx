import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CheckCircle2, Circle, Clock, Flame, Target, TrendingUp } from 'lucide-react';
import { mockDataService, HABIT_CATEGORIES, TIME_SLOTS } from '../services/mockData';
import { useToast } from '../hooks/use-toast';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('all');
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [habitsData, completionsData] = await Promise.all([
        mockDataService.getHabits(),
        mockDataService.getCompletions(today, today)
      ]);
      
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load habits data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const result = await mockDataService.toggleHabitCompletion(habitId, today);
      
      if (result.completed) {
        setCompletions(prev => [...prev, result.completion]);
        toast({
          title: "Great job! 🎉",
          description: "Habit completed for today",
          className: "bg-green-50 border-green-200",
        });
      } else {
        setCompletions(prev => prev.filter(c => c.habitId !== habitId));
        toast({
          title: "Completion removed",
          description: "Habit marked as incomplete",
        });
      }
      
      // Reload habits to update streak info
      const updatedHabits = await mockDataService.getHabits();
      setHabits(updatedHabits);
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    }
  };

  const filterHabitsByTimeSlot = (habits) => {
    if (selectedTimeSlot === 'all') return habits;
    return habits.filter(habit => habit.timeSlot === selectedTimeSlot);
  };

  const getHabitCategory = (categoryId) => {
    return HABIT_CATEGORIES.find(cat => cat.id === categoryId) || HABIT_CATEGORIES[0];
  };

  const getTimeSlot = (timeSlotId) => {
    return TIME_SLOTS.find(slot => slot.id === timeSlotId) || TIME_SLOTS[4];
  };

  const todaysHabits = filterHabitsByTimeSlot(habits).filter(habit => {
    const today = new Date().getDay();
    return habit.targetDays.includes(today);
  });

  const completedToday = completions.length;
  const totalToday = todaysHabits.length;
  const completionRate = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Morning';
            if (hour < 17) return 'Afternoon';
            return 'Evening';
          })()}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {todayFormatted}
        </p>
      </div>

      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Today's Progress</h3>
            <div className="flex items-center space-x-1">
              <Target size={20} />
              <span className="font-bold">{completedToday}/{totalToday}</span>
            </div>
          </div>
          <Progress 
            value={completionRate} 
            className="mb-4 bg-white/20"
          />
          <div className="flex justify-between text-sm opacity-90">
            <span>{Math.round(completionRate)}% Complete</span>
            <span>{totalToday - completedToday} remaining</span>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button
          variant={selectedTimeSlot === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedTimeSlot('all')}
          className="whitespace-nowrap"
        >
          All Times
        </Button>
        {TIME_SLOTS.map(slot => (
          <Button
            key={slot.id}
            variant={selectedTimeSlot === slot.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeSlot(slot.id)}
            className="whitespace-nowrap"
          >
            {slot.icon} {slot.name}
          </Button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {todaysHabits.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No habits for {selectedTimeSlot === 'all' ? 'today' : getTimeSlot(selectedTimeSlot).name.toLowerCase()}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {selectedTimeSlot === 'all' 
                ? "Add some habits to get started on your journey!"
                : "Try selecting a different time slot or add new habits."
              }
            </p>
          </Card>
        ) : (
          todaysHabits.map(habit => {
            const category = getHabitCategory(habit.category);
            const timeSlot = getTimeSlot(habit.timeSlot);
            const isCompleted = completions.some(c => c.habitId === habit.id);

            return (
              <Card 
                key={habit.id} 
                className={`transition-all duration-300 hover:shadow-lg border-l-4 ${
                  isCompleted 
                    ? 'bg-green-50 border-l-green-500 shadow-sm' 
                    : 'hover:shadow-md border-l-gray-200'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-8 w-8 rounded-full transition-all duration-200 ${
                        isCompleted
                          ? 'text-green-600 hover:text-green-700 bg-green-100'
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
                      onClick={() => toggleHabitCompletion(habit.id)}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium truncate ${
                          isCompleted ? 'text-green-800 line-through' : 'text-gray-900 dark:text-white'
                        }`}>
                          {habit.name}
                        </h4>
                        {habit.streak > 0 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Flame size={14} />
                            <span className="text-sm font-semibold">{habit.streak}</span>
                          </div>
                        )}
                      </div>
                      
                      {habit.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {habit.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: category.color + '20', color: category.color }}
                        >
                          {category.icon} {category.name}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs">
                          {timeSlot.icon} {timeSlot.name}
                        </Badge>
                        
                        {habit.reminderEnabled && habit.reminderTime && (
                          <Badge variant="outline" className="text-xs flex items-center space-x-1">
                            <Clock size={10} />
                            <span>{habit.reminderTime}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      {habits.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Habits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(...habits.map(h => h.streak), 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Best Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length) || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;