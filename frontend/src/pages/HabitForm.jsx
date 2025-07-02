import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { mockDataService, HABIT_CATEGORIES, TIME_SLOTS, FREQUENCY_OPTIONS } from '../services/mockData';
import { useToast } from '../hooks/use-toast';

const HabitForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [habit, setHabit] = useState({
    name: '',
    description: '',
    category: 'health',
    timeSlot: 'anytime',
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6], // All days by default
    reminderEnabled: false,
    reminderTime: '09:00'
  });

  useEffect(() => {
    if (isEditing) {
      loadHabit();
    }
  }, [id, isEditing]);

  const loadHabit = async () => {
    try {
      setLoading(true);
      const habits = await mockDataService.getHabits();
      const existingHabit = habits.find(h => h.id === id);
      
      if (existingHabit) {
        setHabit(existingHabit);
      } else {
        toast({
          title: "Error",
          description: "Habit not found",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading habit:', error);
      toast({
        title: "Error",
        description: "Failed to load habit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!habit.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }

    if (habit.targetDays.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one day",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await mockDataService.updateHabit(id, habit);
        toast({
          title: "Success! ✅",
          description: "Habit updated successfully",
          className: "bg-green-50 border-green-200",
        });
      } else {
        await mockDataService.createHabit(habit);
        toast({
          title: "Great! 🎉",
          description: "New habit created successfully",
          className: "bg-green-50 border-green-200",
        });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error saving habit:', error);
      toast({
        title: "Error",
        description: "Failed to save habit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      setLoading(true);
      await mockDataService.deleteHabit(id);
      toast({
        title: "Deleted",
        description: "Habit deleted successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTargetDay = (dayIndex) => {
    setHabit(prev => ({
      ...prev,
      targetDays: prev.targetDays.includes(dayIndex)
        ? prev.targetDays.filter(d => d !== dayIndex)
        : [...prev.targetDays, dayIndex].sort()
    }));
  };

  const getDayName = (index) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const getCategory = (categoryId) => {
    return HABIT_CATEGORIES.find(cat => cat.id === categoryId) || HABIT_CATEGORIES[0];
  };

  const getTimeSlot = (timeSlotId) => {
    return TIME_SLOTS.find(slot => slot.id === timeSlotId) || TIME_SLOTS[4];
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Habit' : 'New Habit'}
        </h1>

        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Drink 8 glasses of water"
                value={habit.name}
                onChange={(e) => setHabit(prev => ({ ...prev, name: e.target.value }))}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add some details about this habit..."
                value={habit.description}
                onChange={(e) => setHabit(prev => ({ ...prev, description: e.target.value }))}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category & Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category & Timing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {HABIT_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setHabit(prev => ({ ...prev, category: category.id }))}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      habit.category === category.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Best Time</Label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map(timeSlot => (
                  <button
                    key={timeSlot.id}
                    type="button"
                    onClick={() => setHabit(prev => ({ ...prev, timeSlot: timeSlot.id }))}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      habit.timeSlot === timeSlot.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{timeSlot.icon}</span>
                      <span className="text-sm font-medium">{timeSlot.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Days of the week</Label>
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => toggleTargetDay(dayIndex)}
                    className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                      habit.targetDays.includes(dayIndex)
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {getDayName(dayIndex)}
                  </button>
                ))}
              </div>
              
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHabit(prev => ({ ...prev, targetDays: [0, 1, 2, 3, 4, 5, 6] }))}
                >
                  Every Day
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHabit(prev => ({ ...prev, targetDays: [1, 2, 3, 4, 5] }))}
                >
                  Weekdays
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setHabit(prev => ({ ...prev, targetDays: [0, 6] }))}
                >
                  Weekends
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reminders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders">Enable Reminders</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get notified to complete this habit
                </p>
              </div>
              <Switch
                id="reminders"
                checked={habit.reminderEnabled}
                onCheckedChange={(checked) => setHabit(prev => ({ ...prev, reminderEnabled: checked }))}
              />
            </div>

            {habit.reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={habit.reminderTime}
                  onChange={(e) => setHabit(prev => ({ ...prev, reminderTime: e.target.value }))}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{habit.name || 'Habit Name'}</h3>
              {habit.description && (
                <p className="text-gray-600 dark:text-gray-400">{habit.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge style={{ backgroundColor: getCategory(habit.category).color + '20', color: getCategory(habit.category).color }}>
                  {getCategory(habit.category).icon} {getCategory(habit.category).name}
                </Badge>
                <Badge variant="outline">
                  {getTimeSlot(habit.timeSlot).icon} {getTimeSlot(habit.timeSlot).name}
                </Badge>
                <Badge variant="outline">
                  {habit.targetDays.length === 7 ? 'Daily' : `${habit.targetDays.length} days/week`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save size={18} />
                <span>{isEditing ? 'Update' : 'Create'} Habit</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;