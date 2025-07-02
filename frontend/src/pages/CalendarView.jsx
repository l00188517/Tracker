import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { mockDataService, HABIT_CATEGORIES } from '../services/mockData';
import { useToast } from '../hooks/use-toast';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get extended range for better calendar view
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date(endOfMonth);
      endDate.setDate(endDate.getDate() + 7);

      const [habitsData, completionsData] = await Promise.all([
        mockDataService.getHabits(),
        mockDataService.getCompletions(
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      ]);
      
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    
    // Start from Sunday
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 42); // 6 weeks
    
    for (let date = new Date(startDate); date < endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    return days;
  };

  const getCompletionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return completions.filter(c => c.date === dateStr);
  };

  const getHabitsForDate = (date) => {
    const dayOfWeek = date.getDay();
    return habits.filter(habit => habit.targetDays.includes(dayOfWeek));
  };

  const getCompletionRate = (date) => {
    const dateCompletions = getCompletionsForDate(date);
    const dateHabits = getHabitsForDate(date);
    
    if (dateHabits.length === 0) return 0;
    return (dateCompletions.length / dateHabits.length) * 100;
  };

  const getDateStatus = (date) => {
    const completionRate = getCompletionRate(date);
    if (completionRate === 100) return 'perfect';
    if (completionRate >= 70) return 'good';
    if (completionRate >= 30) return 'partial';
    return 'none';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'perfect': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'partial': return 'bg-yellow-500';
      default: return 'bg-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'perfect': return 'Perfect Day! 🎉';
      case 'good': return 'Great Progress! 👍';
      case 'partial': return 'Some Progress 📈';
      default: return 'No Habits Done';
    }
  };

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Calendar View 📅
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Track your habit completion over time
        </p>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft size={18} />
            </Button>
            <CardTitle className="text-lg">{monthYear}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {getMonthDays().map((date, index) => {
              const dateCompletions = getCompletionsForDate(date);
              const dateHabits = getHabitsForDate(date);
              const status = getDateStatus(date);
              const completionRate = getCompletionRate(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square rounded-lg p-1 transition-all duration-200 hover:scale-105 relative ${
                    isToday(date)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : isCurrentMonth(date)
                      ? 'hover:bg-gray-50'
                      : 'text-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {date.getDate()}
                  </div>
                  
                  {dateHabits.length > 0 && (
                    <div 
                      className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full ${getStatusColor(status)}`}
                      title={`${dateCompletions.length}/${dateHabits.length} habits completed`}
                    />
                  )}
                  
                  {isToday(date) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Perfect (100%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Great (70%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Partial (30%+)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <span className="text-sm">None (0%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <CalendarIcon size={20} />
              <span>{formatDate(selectedDate)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dateHabits = getHabitsForDate(selectedDate);
              const dateCompletions = getCompletionsForDate(selectedDate);
              const status = getDateStatus(selectedDate);
              
              if (dateHabits.length === 0) {
                return (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No habits scheduled for this day
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dateCompletions.length}/{dateHabits.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getStatusText(status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dateHabits.map(habit => {
                      const category = HABIT_CATEGORIES.find(cat => cat.id === habit.category);
                      const isCompleted = dateCompletions.some(c => c.habitId === habit.id);
                      
                      return (
                        <div
                          key={habit.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className={`flex-shrink-0 ${
                            isCompleted ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <CheckCircle2 size={18} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${
                              isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                            }`}>
                              {habit.name}
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-xs mt-1"
                              style={{ 
                                backgroundColor: category.color + '20', 
                                color: category.color 
                              }}
                            >
                              {category.icon} {category.name}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">This Month Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const monthDays = getMonthDays().filter(date => isCurrentMonth(date));
            const perfectDays = monthDays.filter(date => getDateStatus(date) === 'perfect').length;
            const goodDays = monthDays.filter(date => getDateStatus(date) === 'good').length;
            const totalActiveDays = monthDays.filter(date => getHabitsForDate(date).length > 0).length;
            
            return (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{perfectDays}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Perfect Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{goodDays}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Good Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{totalActiveDays}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active Days</div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;