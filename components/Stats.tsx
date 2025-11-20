import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserSettings } from '../types';
import { WEEKDAYS } from '../constants';
import { PrivacyMask } from './PrivacyMask';
import { Calendar, TrendingUp, DollarSign, Award } from 'lucide-react';

interface StatsProps {
    settings: UserSettings;
}

// Custom Tooltip component to handle privacy logic inside the chart
const CustomTooltip = ({ active, payload, label, privacyMode }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      // Added min-w-[90px] to ensure container doesn't shrink too much, accommodating the privacy mask
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 min-w-[90px] text-center z-50 relative">
        <p className="text-xs font-bold text-slate-400 mb-1 text-left">{label}</p>
        <PrivacyMask enabled={privacyMode} placeholderType="mini">
             <p className="text-sm font-bold text-orange-500">¥{value.toFixed(0)}</p>
        </PrivacyMask>
      </div>
    );
  }
  return null;
};

export const Stats: React.FC<StatsProps> = ({ settings }) => {
  const [now, setNow] = useState(new Date());

  // Update time every second to show real-time accumulation
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 100); // 100ms for smooth feel
    return () => clearInterval(timer);
  }, []);

  // --- Calculation Engine ---
  const calculations = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // Helper: Get daily target for specific settings (allows future history expansion)
    const getDailyTarget = (salary: number, restDays: number[]) => {
        const workDaysPerWeek = 7 - restDays.length;
        const avgMonthlyWorkDays = Math.max(1, workDaysPerWeek * 4.33);
        return salary / avgMonthlyWorkDays;
    };

    const currentDailyTarget = getDailyTarget(settings.monthlySalary, settings.restDays);

    // 1. Calculate Today's Real-time Earnings
    const calculateTodayEarnings = () => {
        const dayIndex = today.getDay();
        if (settings.restDays.includes(dayIndex)) return 0;

        const [startH, startM] = settings.workStartHour.split(':').map(Number);
        const [endH, endM] = settings.workEndHour.split(':').map(Number);
        
        const startTime = new Date(today);
        startTime.setHours(startH, startM, 0, 0);
        const endTime = new Date(today);
        endTime.setHours(endH, endM, 0, 0);

        const totalWorkSecs = (endTime.getTime() - startTime.getTime()) / 1000;
        if (totalWorkSecs <= 0) return 0;

        let elapsed = (now.getTime() - startTime.getTime()) / 1000;
        
        // FIX: If work is over, return full daily target (avoids precision mismatch)
        if (elapsed >= totalWorkSecs) {
            return currentDailyTarget;
        }

        elapsed = Math.max(0, elapsed);
        const ratePerSec = currentDailyTarget / totalWorkSecs;
        return elapsed * ratePerSec;
    };

    const todayEarnings = calculateTodayEarnings();

    // 2. Calculate Past Income (Month-to-Date and Year-to-Date)
    // Note: In a real app with persistent history, we would look up `settings.history` here.
    // For now, we simulate "past history" using current settings to fill the gaps so the user sees data immediately.
    
    let monthTotal = 0;
    let yearTotal = 0;

    // We iterate backwards from yesterday to Jan 1st
    // Optimization: This is a lightweight loop for client-side (max 366 iterations)
    const startOfYear = new Date(currentYear, 0, 1);
    const yesterday = new Date(currentYear, currentMonth, currentDay - 1);
    
    // If today is Jan 1st, yesterday is last year, so the loop won't run (correctly).
    for (let d = new Date(startOfYear); d <= yesterday; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getDay();
        
        // Check if we have a history record (Future proofing)
        const historyRecord = settings.history?.find(h => h.date === dateStr);
        
        let dailyIncome = 0;

        if (historyRecord) {
            dailyIncome = historyRecord.earned;
        } else {
            // Simulation fallback
            const isRest = settings.restDays.includes(dayOfWeek);
            dailyIncome = isRest ? 0 : currentDailyTarget;
        }

        yearTotal += dailyIncome;
        if (d.getMonth() === currentMonth) {
            monthTotal += dailyIncome;
        }
    }

    // Add today's real-time value
    monthTotal += todayEarnings;
    yearTotal += todayEarnings;

    return {
        todayEarnings,
        monthTotal,
        yearTotal,
        currentDailyTarget
    };
  }, [now, settings]);

  // --- Chart Data Generation ---
  const chartData = useMemo(() => {
      const orderedWeekDays = [1, 2, 3, 4, 5, 6, 0]; // Mon -> Sun
      return orderedWeekDays.map(dayId => {
         const dayInfo = WEEKDAYS.find(d => d.id === dayId);
         const isRestDay = settings.restDays.includes(dayId);
         return {
             name: dayInfo?.short || '',
             income: isRestDay ? 0 : calculations.currentDailyTarget,
             isRestDay
         };
      });
  }, [settings.restDays, calculations.currentDailyTarget]);


  return (
    <div className="p-6 max-w-md mx-auto w-full space-y-6 h-full overflow-y-auto pb-24 relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Award className="text-primary" size={24} />
        <h2 className="text-2xl font-bold text-slate-800">收入总览 (Overview)</h2>
      </div>
      
      {/* Primary Card: Monthly Income */}
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-20">
              <Calendar size={120} />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                  <span className="text-sm font-bold uppercase tracking-wider">本月已赚 (This Month)</span>
              </div>
              
              <PrivacyMask enabled={settings.privacyMode} placeholderType="block" className="min-h-[4rem] flex items-center">
                 <div className="flex items-baseline gap-1">
                     <span className="text-2xl font-bold opacity-80">¥</span>
                     <span className="text-5xl font-black tracking-tight tabular-nums">
                         {calculations.monthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                     </span>
                 </div>
              </PrivacyMask>

              <div className="mt-4 flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                  <TrendingUp size={16} />
                  <span>Keep going! 🚀</span>
              </div>
          </div>
      </div>

      {/* Secondary Card: Yearly Income */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 opacity-10">
              <DollarSign size={100} />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1 opacity-90">
                  <span className="text-xs font-bold uppercase tracking-wider">本年累计 (Year to Date)</span>
              </div>
              
              <PrivacyMask enabled={settings.privacyMode} placeholderType="block" className="min-h-[3rem] flex items-center">
                 <div className="flex items-baseline gap-1">
                     <span className="text-xl font-bold opacity-80">¥</span>
                     <span className="text-4xl font-black tracking-tight tabular-nums">
                         {calculations.yearTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                     </span>
                 </div>
              </PrivacyMask>
          </div>
      </div>

      {/* Tertiary Section: Reference Chart */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <div className="flex justify-between items-end mb-4">
            <h3 className="text-slate-700 font-bold text-sm uppercase flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" />
                周收入参考 (Trend)
            </h3>
            <PrivacyMask enabled={settings.privacyMode} placeholderType="mini">
               <span className="text-xs text-slate-400 font-medium">Est. Daily: ¥{calculations.currentDailyTarget.toFixed(0)}</span>
            </PrivacyMask>
         </div>
         
         <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={<CustomTooltip privacyMode={settings.privacyMode} />}
                    wrapperStyle={{ outline: 'none', pointerEvents: 'auto' }}
                />
                <Bar dataKey="income" radius={[4, 4, 4, 4]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isRestDay ? '#e2e8f0' : (settings.privacyMode ? '#d8b4fe' : '#FF8C00')} />
                ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-slate-400 px-8 leading-relaxed">
          * 历史数据基于当前薪资估算，实际收入以当时设置为准。<br/>
          (Historical estimates based on current settings)
      </p>
    </div>
  );
};