import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  Heart,
  Github
} from 'lucide-react';
import { mockDataService } from '../services/mockData';
import { useToast } from '../hooks/use-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    weekStartsOn: 1,
    timeFormat: '24h'
  });
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    loadHabits();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await mockDataService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const habitsData = await mockDataService.getHabits();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await mockDataService.updateSettings(updatedSettings);
      
      toast({
        title: "Settings updated",
        description: "Your preference has been saved",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    try {
      const exportData = {
        habits: habits,
        settings: settings,
        completions: JSON.parse(localStorage.getItem('habits-tracker-completions') || '[]'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Data exported! 📁",
        description: "Your habits data has been downloaded",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!importData.habits || !Array.isArray(importData.habits)) {
          throw new Error('Invalid data format');
        }
        
        // Store imported data
        localStorage.setItem('habits-tracker-habits', JSON.stringify(importData.habits));
        if (importData.completions) {
          localStorage.setItem('habits-tracker-completions', JSON.stringify(importData.completions));
        }
        if (importData.settings) {
          localStorage.setItem('habits-tracker-settings', JSON.stringify(importData.settings));
          setSettings(importData.settings);
        }
        
        // Reload habits
        await loadHabits();
        
        toast({
          title: "Data imported! 🎉",
          description: "Your habits data has been restored",
          className: "bg-green-50 border-green-200",
        });
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: "Error",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const clearAllData = () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    try {
      localStorage.removeItem('habits-tracker-habits');
      localStorage.removeItem('habits-tracker-completions');
      localStorage.removeItem('habits-tracker-settings');
      
      // Reinitialize with empty data
      mockDataService.initializeData();
      setHabits([]);
      setSettings({
        theme: 'light',
        notifications: true,
        weekStartsOn: 1,
        timeFormat: '24h'
      });
      
      toast({
        title: "Data cleared",
        description: "All habits and data have been removed",
        className: "bg-amber-50 border-amber-200",
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive",
      });
    }
  };

  const installPWA = () => {
    if ('serviceWorker' in navigator) {
      toast({
        title: "PWA Ready! 📱",
        description: "Add to home screen from your browser menu",
        className: "bg-blue-50 border-blue-200",
      });
    } else {
      toast({
        title: "Not available",
        description: "PWA installation not supported in this browser",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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
      <div className="text-center pt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings ⚙️
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Customize your habit tracking experience
        </p>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Info size={20} />
            <span>App Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Version</span>
            <Badge variant="outline">1.0.0</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Habits</span>
            <Badge variant="secondary">{habits.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">PWA Status</span>
            <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>
          </div>
          <Button 
            onClick={installPWA}
            className="w-full mt-3"
            variant="outline"
          >
            📱 Install as App
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <SettingsIcon size={20} />
            <span>Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive reminders for your habits
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Week starts on</Label>
            <div className="flex space-x-2">
              {[
                { value: 0, label: 'Sunday' },
                { value: 1, label: 'Monday' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('weekStartsOn', option.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 text-sm ${
                    settings.weekStartsOn === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time format</Label>
            <div className="flex space-x-2">
              {[
                { value: '12h', label: '12 Hour' },
                { value: '24h', label: '24 Hour' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('timeFormat', option.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 text-sm ${
                    settings.timeFormat === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Upload size={20} />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={exportData}
            className="w-full"
            variant="outline"
          >
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button 
              className="w-full"
              variant="outline"
            >
              <Upload size={16} className="mr-2" />
              Import Data
            </Button>
          </div>
          
          <Button 
            onClick={clearAllData}
            className="w-full"
            variant="destructive"
          >
            <Trash2 size={16} className="mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Heart size={20} />
            <span>About</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            Habit Tracker PWA helps you build positive habits and break negative ones through consistent tracking and beautiful visualizations.
          </p>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Built with React, PWA technology</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <span>Offline support, installable app</span>
          </div>
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Made with ❤️ for better habits
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;