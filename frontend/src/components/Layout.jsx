import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

const Layout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Main content */}
      <main className="pb-20 min-h-screen">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation currentPath={location.pathname} />
    </div>
  );
};

export default Layout;