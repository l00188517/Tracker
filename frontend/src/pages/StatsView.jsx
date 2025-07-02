import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { TrendingUp, Target, Flame, Award, Calendar, Clock } from 'lucide-react';
import { mockDataService, HABIT_CATEGORIES } from '../services/mockData';
import { useToast } from '../hooks/use-toast';

const StatsView = () => {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // 7, 30, 90 days
  const { toast } = useToast();

  useEffect(() => {
    loadStatsData();
  }, [timeframe]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeframe));

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
      console.error('Error loading stats data:', error);
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverallStats = () => {
    const totalHabits = habits.length;
    const totalCompletions = completions.length;
    const totalPossibleCompletions = habits.reduce((acc, habit) => {
      const daysInTimeframe = parseInt(timeframe);
      const targetDaysInWeek = habit.targetDays.length;
      const weeksInTimeframe = daysInTimeframe / 7;
      return acc + (targetDaysInWeek * weeksInTimeframe);
    }, 0);

    const completionRate = totalPossibleCompletions > 0 
      ? (totalCompletions / totalPossibleCompletions) * 100 
      : 0;

    const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
    const currentStreaks = habits.reduce((acc, h) => acc + h.streak, 0);
    const avgStreak = habits.length > 0 ? currentStreaks / habits.length : 0;

    return {
      totalHabits,
      totalCompletions,
      completionRate,
      bestStreak,
      avgStreak,
      totalPossibleCompletions
    };
  };

  const getHabitStats = (habit) => {
    const habitCompletions = completions.filter(c => c.habitId === habit.id);
    const daysInTimeframe = parseInt(timeframe);
    const targetDaysInWeek = habit.targetDays.length;
    const weeksInTimeframe = daysInTimeframe / 7;
    const possibleCompletions = targetDaysInWeek * weeksInTimeframe;
    
    const completionRate = possibleCompletions > 0 
      ? (habitCompletions.length / possibleCompletions) * 100 
      : 0;

    return {
      completions: habitCompletions.length,
      possibleCompletions: Math.round(possibleCompletions),
      completionRate
    };
  };

  const getCategoryStats = () => {
    const categoryStats = {};
    
    HABIT_CATEGORIES.forEach(category => {
      const categoryHabits = habits.filter(h => h.category === category.id);
      const categoryCompletions = completions.filter(c => 
        categoryHabits.some(h => h.id === c.habitId)
      );
      
      if (categoryHabits.length > 0) {
        const totalPossible = categoryHabits.reduce((acc, habit) => {
          const daysInTimeframe = parseInt(timeframe);
          const targetDaysInWeek = habit.targetDays.length;
          const weeksInTimeframe = daysInTimeframe / 7;
          return acc + (targetDaysInWeek * weeksInTimeframe);
        }, 0);

        categoryStats[category.id] = {
          ...category,
          habits: categoryHabits.length,
          completions: categoryCompletions.length,
          completionRate: totalPossible > 0 ? (categoryCompletions.length / totalPossible) * 100 : 0
        };
      }
    });

    return Object.values(categoryStats).sort((a, b) => b.completionRate - a.completionRate);
  };

  const getTopPerformingHabits = () => {
    return habits
      .map(habit => ({
        ...habit,
        stats: getHabitStats(habit)
      }))
      .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
      .slice(0, 5);
  };

  const getWeeklyTrend = () => {
    const weeks = [];
    const endDate = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekEnd = new Date(endDate);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      const weekCompletions = completions.filter(c => {
        const completionDate = new Date(c.date);
        return completionDate >= weekStart && completionDate <= weekEnd;
      });
      
      weeks.unshift({
        week: `Week ${4 - i}`,
        completions: weekCompletions.length,
        startDate: weekStart,
        endDate: weekEnd
      });
    }
    
    return weeks;
  };

  const overallStats = getOverallStats();
  const categoryStats = getCategoryStats();
  const topHabits = getTopPerformingHabits();
  const weeklyTrend = getWeeklyTrend();

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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
          Statistics 📊
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Track your progress and insights
        </p>
      </div>

      {/* Timeframe Selection */}
      <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { value: '7', label: '7 Days' },
          { value: '30', label: '30 Days' },
          { value: '90', label: '90 Days' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setTimeframe(option.value)}
            className={`flex-1 py-2 px-3 rounded-md transition-all duration-200 text-sm font-medium ${
              timeframe === option.value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Overall Stats */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp size={20} />
            <span>Overall Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(overallStats.completionRate)}%</div>
              <div className="text-sm opacity-90">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.totalCompletions}</div>
              <div className="text-sm opacity-90">Total Completions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{overallStats.bestStreak}</div>
              <div className="text-sm opacity-90">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(overallStats.avgStreak)}</div>
              <div className="text-sm opacity-90">Avg Streak</div>
            </div>
          </div>
          <Progress 
            value={overallStats.completionRate} 
            className="mt-4 bg-white/20"
          />
        </CardContent>
      </Card>

      {/* Category Performance */}
      {categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target size={20} />
              <span>Category Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.map(category => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{Math.round(category.completionRate)}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {category.completions} completions
                    </div>
                  </div>
                </div>
                <Progress 
                  value={category.completionRate} 
                  className="h-2"
                  style={{ 
                    backgroundColor: category.color + '20',
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Top Performing Habits */}
      {topHabits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award size={20} />
              <span>Top Performing Habits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topHabits.map((habit, index) => {
              const category = HABIT_CATEGORIES.find(cat => cat.id === habit.category);
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐';
              
              return (
                <div key={habit.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xl">{medal}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm truncate">{habit.name}</h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-semibold">
                          {Math.round(habit.stats.completionRate)}%
                        </span>
                        {habit.streak > 0 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Flame size={12} />
                            <span className="text-xs font-semibold">{habit.streak}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: category.color + '20', color: category.color }}
                      >
                        {category.icon} {category.name}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {habit.stats.completions}/{habit.stats.possibleCompletions}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Calendar size={20} />
            <span>Weekly Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyTrend.map((week, index) => {
              const maxCompletions = Math.max(...weeklyTrend.map(w => w.completions), 1);
              const barWidth = (week.completions / maxCompletions) * 100;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{week.week}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {week.completions} completions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Clock size={20} />
            <span>Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {overallStats.completionRate >= 80 && (
              <div className="flex items-start space-x-2">
                <span className="text-green-600">🎉</span>
                <p className="text-green-800 dark:text-green-200">
                  Excellent work! You're maintaining a {Math.round(overallStats.completionRate)}% completion rate.
                </p>
              </div>
            )}
            
            {overallStats.bestStreak >= 7 && (
              <div className="flex items-start space-x-2">
                <span className="text-orange-600">🔥</span>
                <p className="text-orange-800 dark:text-orange-200">
                  Amazing streak! Your best streak is {overallStats.bestStreak} days.
                </p>
              </div>
            )}
            
            {categoryStats.length > 0 && (
              <div className="flex items-start space-x-2">
                <span className="text-blue-600">📈</span>
                <p className="text-blue-800 dark:text-blue-200">
                  Your strongest category is {categoryStats[0].name} with {Math.round(categoryStats[0].completionRate)}% completion rate.
                </p>
              </div>
            )}
            
            {overallStats.completionRate < 50 && (
              <div className="flex items-start space-x-2">
                <span className="text-amber-600">💪</span>
                <p className="text-amber-800 dark:text-amber-200">
                  Keep pushing! Small consistent steps lead to big results.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsView;