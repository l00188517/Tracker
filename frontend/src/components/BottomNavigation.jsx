import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, BarChart3, Settings, Plus } from 'lucide-react';

const BottomNavigation = ({ currentPath }) => {
  const navItems = [
    { path: '/', icon: Home, label: 'Today' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/add-habit', icon: Plus, label: 'Add', isSpecial: true },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label, isSpecial }) => {
          const isActive = currentPath === path || 
            (path === '/' && currentPath === '/') ||
            (path === '/add-habit' && currentPath.includes('/edit-habit'));

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isSpecial
                  ? 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 transform hover:scale-105'
                  : isActive
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                  : 'text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400'
              }`}
            >
              <Icon size={isSpecial ? 24 : 20} className={isSpecial ? 'mb-0' : 'mb-1'} />
              {!isSpecial && (
                <span className="text-xs font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;