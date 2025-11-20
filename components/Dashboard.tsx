import React, { useEffect, useState, useRef } from 'react';
import { UserSettings, WorkStats } from '../types';
import { generateMotivationalQuote } from '../services/geminiService';
import { FALLBACK_QUOTES, REST_DAY_QUOTES } from '../constants';
import { Coins, Clock, Target, TrendingUp, Quote as QuoteIcon, Sparkles, Coffee, BatteryCharging, Eye, EyeOff } from 'lucide-react';
import { PrivacyMask } from './PrivacyMask';

interface DashboardProps {
  settings: UserSettings;
  onTogglePrivacy: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings, onTogglePrivacy }) => {
  const [stats, setStats] = useState<WorkStats>({
    currentEarnings: 0,
    elapsedTimeSeconds: 0,
    progressPercentage: 0,
    isWorking: false,
    isRestDay: false,
  });
  const [quote, setQuote] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const intervalRef = useRef<number | null>(null);

  // Calculations
  const calculateStats = () => {
    const now = new Date();
    const todayDayIndex = now.getDay();
    const isRestDay = settings.restDays.includes(todayDayIndex);

    if (isRestDay) {
        setStats({
            currentEarnings: 0,
            elapsedTimeSeconds: 0,
            progressPercentage: 100,
            isWorking: false,
            isRestDay: true
        });
        return;
    }

    const [startHour, startMinute] = settings.workStartHour.split(':').map(Number);
    const [endHour, endMinute] = settings.workEndHour.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);

    // Work duration in seconds
    const totalWorkSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
    if (totalWorkSeconds <= 0) return; 

    // Rate Calculation
    const workDaysPerWeek = 7 - settings.restDays.length;
    const avgDaysPerMonth = Math.max(1, workDaysPerWeek * 4.33);
    const dailySalary = settings.monthlySalary / avgDaysPerMonth;
    const perSecondRate = dailySalary / totalWorkSeconds;

    let elapsed = (now.getTime() - startTime.getTime()) / 1000;
    
    // FIX: If work is finished (elapsed >= total), force earnings to equal dailySalary exactly.
    if (elapsed >= totalWorkSeconds) {
        setStats({
            currentEarnings: dailySalary, 
            elapsedTimeSeconds: totalWorkSeconds,
            progressPercentage: 100,
            isWorking: false,
            isRestDay: false
        });
        return;
    }

    let isWorking = true;

    if (elapsed < 0) {
        elapsed = 0;
        isWorking = false; // Not started
    } 

    const currentEarned = elapsed * perSecondRate;
    const progress = (elapsed / totalWorkSeconds) * 100;

    setStats({
      currentEarnings: currentEarned,
      elapsedTimeSeconds: elapsed,
      progressPercentage: Math.min(100, Math.max(0, progress)),
      isWorking: now >= startTime && now <= endTime,
      isRestDay: false
    });
  };

  // Effect loop
  useEffect(() => {
    calculateStats(); // Initial
    intervalRef.current = window.setInterval(calculateStats, 100); 
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Initial Quote Logic
  useEffect(() => {
    const now = new Date();
    const todayDayIndex = now.getDay();
    const isRest = settings.restDays.includes(todayDayIndex);
    
    let pool = isRest ? REST_DAY_QUOTES : FALLBACK_QUOTES;
    const randomQuote = pool[Math.floor(Math.random() * pool.length)];
    setQuote(randomQuote.text);
  }, [settings.restDays]);

  const handleRefreshQuote = async () => {
    if (!process.env.API_KEY) {
        let pool = stats.isRestDay ? REST_DAY_QUOTES : FALLBACK_QUOTES;
        const randomQuote = pool[Math.floor(Math.random() * pool.length)];
        setQuote(randomQuote.text);
        return;
    }

    setIsThinking(true);
    const aiQuote = await generateMotivationalQuote(
        stats.currentEarnings, 
        stats.progressPercentage, 
        settings.monthlySalary,
        stats.isRestDay
    );
    if (aiQuote) setQuote(aiQuote);
    setIsThinking(false);
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const workDaysPerWeek = 7 - settings.restDays.length;
  const avgDaysPerMonth = Math.max(1, workDaysPerWeek * 4.33);
  const dailyTarget = settings.monthlySalary / avgDaysPerMonth;
  const workDurationHours = (settings.workEndHour.split(':').reduce((acc, time) => (60 * acc) + +time, 0)/60 - settings.workStartHour.split(':').reduce((acc, time) => (60 * acc) + +time, 0)/60);
  const hourlyRate = dailyTarget / workDurationHours;

  // Render Rest Day View
  if (stats.isRestDay) {
      return (
        <div className="p-4 max-w-md mx-auto w-full space-y-6 pb-24 relative z-10 h-full overflow-y-auto">
            {/* Rest Header */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-3xl p-6 shadow-lg shadow-blue-200 relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 p-4 opacity-20 animate-pulse-fast">
                    <Coffee size={100} className="text-white" />
                </div>
                
                <p className="font-medium mb-1 text-blue-100">今日状态 (Today's Status)</p>
                <h1 className="text-4xl font-bold mb-4 tracking-tight">休息日 🌴</h1>
                
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl p-3 w-fit">
                   <BatteryCharging className="text-green-300 animate-pulse" size={24} />
                   <span className="font-bold text-sm">正在充电中... (Recharging)</span>
                </div>
            </div>

             {/* Rest Stats */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-4 shadow-md flex flex-col items-center justify-center border-2 border-transparent">
                   <span className="text-4xl mb-2">😴</span>
                   <span className="text-xs text-slate-400 font-bold">MODE</span>
                   <span className="text-lg font-bold text-slate-700">Relaxing</span>
                </div>
                <div className="bg-white rounded-3xl p-4 shadow-md flex flex-col items-center justify-center border-2 border-transparent">
                   <span className="text-4xl mb-2">🎁</span>
                   <span className="text-xs text-slate-400 font-bold">GAINED</span>
                   <span className="text-lg font-bold text-slate-700">Joy +100</span>
                </div>
             </div>

            {/* Rest Quote */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 relative">
                <QuoteIcon className="absolute top-4 left-4 text-blue-300 w-8 h-8 opacity-50" />
                <p className="text-slate-700 italic text-center relative z-10 font-medium text-lg px-2">
                "{quote}"
                </p>
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={handleRefreshQuote}
                        disabled={isThinking}
                        className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1 hover:text-blue-600 transition-colors disabled:opacity-50"
                    >
                        {isThinking ? 'Thinking...' : 'More Relaxing Vibes'} <Sparkles size={12} />
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // Render Work Day View
  return (
    <div className="p-4 max-w-md mx-auto w-full space-y-6 pb-24 relative z-10 h-full overflow-y-auto">
      
      {/* Header Card */}
      <div className={`rounded-3xl p-6 shadow-lg border-b-4 relative overflow-hidden transition-colors duration-500 ${
          settings.privacyMode 
          ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100' 
          : 'bg-white border-orange-100'
      }`}>

         <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Coins size={100} className={settings.privacyMode ? "text-purple-500" : "text-primary"} />
         </div>
         
         <div className="flex justify-between items-start mb-1 relative z-10">
             <p className="text-slate-500 font-medium">今日已赚 (Today's Income)</p>
             <button
                onClick={(e) => {
                    e.stopPropagation();
                    onTogglePrivacy();
                }}
                className="p-2 -mr-2 -mt-2 rounded-full hover:bg-purple-100 text-[#8B5CF6] transition-colors active:scale-95"
                aria-label={settings.privacyMode ? "Show amounts" : "Hide amounts"}
             >
                {settings.privacyMode ? <EyeOff size={24} /> : <Eye size={24} />}
             </button>
         </div>

         <div className="flex items-baseline gap-1 min-h-[4rem] relative z-10">
            <PrivacyMask enabled={settings.privacyMode} placeholderType="block">
                <span className="text-4xl font-bold text-slate-800">¥</span>
                <span className="text-6xl font-black text-primary tracking-tighter tabular-nums">
                    {(stats.progressPercentage >= 100) ? stats.currentEarnings.toFixed(2) : stats.currentEarnings.toFixed(4)}
                </span>
            </PrivacyMask>
         </div>
         
         <div className="mt-4 flex gap-2 relative z-10">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${stats.isWorking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-2 h-2 rounded-full ${stats.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                {stats.isWorking ? '赚钱中ing' : '休息中'}
            </div>
         </div>
      </div>

      {/* Progress Ring & Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        <div className="bg-white rounded-3xl p-4 shadow-md flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-100 transition-colors">
           <div className="relative w-20 h-20 mb-2 flex items-center justify-center">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${stats.progressPercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
               </svg>
               <span className="absolute text-sm font-bold text-blue-600">{Math.floor(stats.progressPercentage)}%</span>
           </div>
           <span className="text-xs text-slate-400 font-bold">今日进度</span>
        </div>

        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl text-primary"><Target size={18} /></div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">目标</p>
                    <PrivacyMask enabled={settings.privacyMode} placeholderType="text">
                        <p className="text-sm font-bold text-slate-700">¥{dailyTarget.toFixed(2)}</p>
                    </PrivacyMask>
                </div>
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl text-accent"><Clock size={18} /></div>
                <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">时长</p>
                    <p className="text-sm font-bold text-slate-700">{formatTime(stats.elapsedTimeSeconds)}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Hourly Rate Visualization */}
      <div className={`text-white rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors duration-500 h-40 flex flex-col justify-between ${settings.privacyMode ? 'bg-slate-700' : 'bg-slate-800'}`}>
          <div className="flex justify-between items-center relative z-10">
             <h3 className="font-bold flex items-center gap-2"><TrendingUp size={18} className="text-yellow-400" /> 时薪 (Hourly)</h3>
          </div>
          
          {/* Fixed height container for value to ensure stability */}
          <div className="h-12 flex items-center w-full relative z-10">
            <PrivacyMask enabled={settings.privacyMode} className="w-full" placeholderType="block">
                <p className="text-3xl font-bold text-yellow-400 flex items-baseline">
                    ¥{hourlyRate.toFixed(2)}
                    <span className="text-sm text-slate-400 font-normal ml-2">/ hour</span>
                </p>
            </PrivacyMask>
          </div>

          {/* Decor */}
          <div className="absolute -bottom-4 -right-4 opacity-10">
            <Target size={80} />
          </div>
      </div>

      {/* Motivational Quote Section */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 rounded-3xl p-6 relative">
         <QuoteIcon className="absolute top-4 left-4 text-yellow-300 w-8 h-8 opacity-50" />
         <p className="text-slate-700 italic text-center relative z-10 font-medium text-lg px-2">
           "{quote}"
         </p>
         <div className="mt-4 flex justify-center">
            <button 
                onClick={handleRefreshQuote}
                disabled={isThinking}
                className="text-xs font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
                {isThinking ? 'Thinking...' : 'Refresh Motivation'} <Sparkles size={12} />
            </button>
         </div>
      </div>

    </div>
  );
};