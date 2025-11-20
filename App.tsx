import React, { useEffect, useState } from 'react';
import { UserSettings, ViewState } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { Stats } from './components/Stats';
import { Settings } from './components/Settings';
import { MoneyRain } from './components/MoneyRain';
import { LayoutDashboard, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('mm_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Backward compatibility & Migration logic
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                // Ensure privacy mode exists
                privacyMode: parsed.privacyMode ?? false,
            };
        } catch (e) {
            return DEFAULT_SETTINGS;
        }
    }
    return DEFAULT_SETTINGS;
  });

  const [view, setView] = useState<ViewState>(
    settings.hasCompletedOnboarding ? ViewState.DASHBOARD : ViewState.ONBOARDING
  );

  // Determine if it's a rest day for background styling
  const [isRestDay, setIsRestDay] = useState(false);

  useEffect(() => {
    localStorage.setItem('mm_settings', JSON.stringify(settings));
    
    // Check for rest day logic only if onboarding complete
    if (settings.hasCompletedOnboarding) {
        const today = new Date().getDay();
        setIsRestDay(settings.restDays.includes(today));
    }
  }, [settings]);

  const handleOnboardingComplete = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setView(ViewState.DASHBOARD);
  };

  const handleReset = () => {
      localStorage.removeItem('mm_settings');
      setSettings(DEFAULT_SETTINGS);
      setView(ViewState.ONBOARDING);
      setIsRestDay(false);
  };

  // Handle quick privacy toggle from Dashboard
  const togglePrivacyMode = () => {
      setSettings(prev => ({ ...prev, privacyMode: !prev.privacyMode }));
  };

  // Calculate background classes based on state
  const getBackgroundClass = () => {
      if (settings.privacyMode) return 'bg-slate-100 selection:bg-purple-200';
      if (isRestDay) return 'bg-blue-50 selection:bg-blue-200';
      return 'bg-[#FFF8E1] selection:bg-orange-200';
  };

  const getOrbColors = () => {
      if (settings.privacyMode) {
          return {
              top: 'bg-purple-300/20',
              bottom: 'bg-green-200/20'
          };
      }
      if (isRestDay) {
          return {
              top: 'bg-blue-200/30',
              bottom: 'bg-purple-200/30'
          };
      }
      return {
          top: 'bg-orange-200/30',
          bottom: 'bg-blue-200/30'
      };
  };

  const orbColors = getOrbColors();

  // Mobile Navigation Bar
  const NavBar = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-white p-2 flex gap-2 z-50 max-w-xs w-full justify-between">
      <button
        onClick={() => setView(ViewState.DASHBOARD)}
        className={`p-4 rounded-full transition-all ${view === ViewState.DASHBOARD ? 'bg-primary text-white shadow-md scale-110' : 'text-slate-400 hover:bg-gray-100'}`}
      >
        <LayoutDashboard size={24} />
      </button>
      <button
        onClick={() => setView(ViewState.STATS)}
        className={`p-4 rounded-full transition-all ${view === ViewState.STATS ? 'bg-secondary text-white shadow-md scale-110' : 'text-slate-400 hover:bg-gray-100'}`}
      >
        <BarChart3 size={24} />
      </button>
      <button
        onClick={() => setView(ViewState.SETTINGS)}
        className={`p-4 rounded-full transition-all ${view === ViewState.SETTINGS ? 'bg-slate-700 text-white shadow-md scale-110' : 'text-slate-400 hover:bg-gray-100'}`}
      >
        <SettingsIcon size={24} />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${getBackgroundClass()} text-slate-900 font-sans overflow-hidden relative transition-colors duration-1000`}>
      {/* Background decorative elements */}
      <div className={`fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] ${orbColors.top} rounded-full blur-3xl pointer-events-none transition-colors duration-1000`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] ${orbColors.bottom} rounded-full blur-3xl pointer-events-none transition-colors duration-1000`} />
      
      {!isRestDay && !settings.privacyMode && <MoneyRain />}

      <main className="h-screen w-full relative flex flex-col">
        {view === ViewState.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {view === ViewState.DASHBOARD && (
          <>
             <Dashboard settings={settings} onTogglePrivacy={togglePrivacyMode} />
             <NavBar />
          </>
        )}

        {view === ViewState.STATS && (
          <>
            <Stats settings={settings} />
            <NavBar />
          </>
        )}

        {view === ViewState.SETTINGS && (
           <>
            <Settings settings={settings} onSave={(s) => { setSettings(s); setView(ViewState.DASHBOARD); }} onReset={handleReset} />
            <NavBar />
           </>
        )}
      </main>
    </div>
  );
};

export default App;