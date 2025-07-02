import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";

// Import pages
import Dashboard from "./pages/Dashboard";
import HabitForm from "./pages/HabitForm";
import CalendarView from "./pages/CalendarView";
import StatsView from "./pages/StatsView";
import Settings from "./pages/Settings";

// Import layout
import Layout from "./components/Layout";

function App() {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-habit" element={<HabitForm />} />
            <Route path="/edit-habit/:id" element={<HabitForm />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;