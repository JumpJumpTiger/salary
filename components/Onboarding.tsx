import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Button } from './Button';
import { ArrowRight, CheckCircle2, Wallet, Calendar, Clock, Coffee } from 'lucide-react';
import { WEEKDAYS } from '../constants';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserSettings>>({
    monthlySalary: undefined,
    restDays: [0, 6], // Default Sat, Sun
    workStartHour: "09:00",
    workEndHour: "18:00",
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      onComplete({
        ...formData as UserSettings,
        hasCompletedOnboarding: true,
      });
    }
  };

  const updateField = (key: keyof UserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleRestDay = (dayId: number) => {
    const current = formData.restDays || [];
    if (current.includes(dayId)) {
      updateField('restDays', current.filter(d => d !== dayId));
    } else {
      updateField('restDays', [...current, dayId]);
    }
  };

  // Calculate estimated daily salary for preview
  const workDaysPerWeek = 7 - (formData.restDays?.length || 0);
  const avgDaysPerMonth = workDaysPerWeek * 4.33;
  const estimatedDaily = (formData.monthlySalary || 0) / (avgDaysPerMonth || 1);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-md mx-auto w-full relative z-10">
      
      {/* Progress Indicator */}
      <div className="w-full flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-2 rounded-full flex-1 transition-colors ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full text-center border-b-8 border-gray-100 min-h-[450px] flex flex-col justify-between">
        
        {/* Step 1: Salary */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500 flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">老板一个月发多少"粮饷"？💰</h2>
            <p className="text-slate-500">输入的月薪仅保存在本地，老板看不见哦！</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">¥</span>
              <input
                type="number"
                min="0"
                max="10000000"
                className="w-full text-2xl font-bold p-4 pl-10 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-center"
                placeholder="10000"
                value={formData.monthlySalary || ''}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                        updateField('monthlySalary', undefined);
                        return;
                    }
                    let num = Number(val);
                    if (isNaN(num)) return;
                    if (num < 0) num = 0;
                    if (num > 10000000) num = 10000000;
                    updateField('monthlySalary', num);
                }}
                autoFocus
              />
            </div>
            <Button fullWidth disabled={!formData.monthlySalary} onClick={handleNext}>
              下一步 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Rest Days */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500 flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Coffee className="w-10 h-10 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">哪几天是你的"回血日"？📅</h2>
            <p className="text-slate-500">选中你通常休息的日子（比如周末）</p>
            
            <div className="grid grid-cols-4 gap-2 mt-4">
                {WEEKDAYS.map((day) => {
                    const isSelected = formData.restDays?.includes(day.id);
                    return (
                        <button
                            key={day.id}
                            onClick={() => toggleRestDay(day.id)}
                            className={`p-3 rounded-xl font-bold transition-all border-2 ${
                                isSelected 
                                ? 'bg-secondary border-secondary text-white shadow-md transform scale-105' 
                                : 'bg-gray-50 border-transparent text-slate-400 hover:bg-gray-100'
                            }`}
                        >
                            {day.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 text-sm text-slate-400">
                每周工作 {7 - (formData.restDays?.length || 0)} 天
            </div>

            <Button variant="secondary" fullWidth onClick={handleNext}>
              继续 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 3: Hours */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-10 duration-500 flex-1 flex flex-col justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">搬砖时间确认 ⏰</h2>
            <p className="text-slate-500">让我们精准计算每一分钟的价值！</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-left">
                <label className="text-sm text-slate-500 block mb-1 ml-1">上班时间</label>
                <input
                  type="time"
                  className="w-full p-3 rounded-xl bg-gray-50 font-bold text-center"
                  value={formData.workStartHour}
                  onChange={(e) => updateField('workStartHour', e.target.value)}
                />
              </div>
              <div className="text-left">
                <label className="text-sm text-slate-500 block mb-1 ml-1">下班时间</label>
                <input
                  type="time"
                  className="w-full p-3 rounded-xl bg-gray-50 font-bold text-center"
                  value={formData.workEndHour}
                  onChange={(e) => updateField('workEndHour', e.target.value)}
                />
              </div>
            </div>

            <Button variant="accent" fullWidth onClick={handleNext}>
              差不多了 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="space-y-6 animate-in zoom-in duration-500 flex-1 flex flex-col justify-center">
             <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <CheckCircle2 className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">搞定！🎉</h2>
            <p className="text-slate-600 text-lg">工作日努力赚钱，<br/>休息日好好充电！</p>
            
            <div className="bg-gray-50 p-4 rounded-xl text-sm text-slate-500">
               预计日薪: <span className="text-slate-800 font-bold">¥{estimatedDaily.toFixed(0)}</span>
            </div>

            <Button variant="primary" size="lg" fullWidth onClick={handleNext} className="shadow-lg shadow-orange-200">
              开启赚钱模式 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};