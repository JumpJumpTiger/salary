import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Button } from './Button';
import { Save, LogOut } from 'lucide-react';
import { WEEKDAYS } from '../constants';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onReset }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);

  const handleChange = (key: keyof UserSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleRestDay = (dayId: number) => {
    const current = formData.restDays || [];
    if (current.includes(dayId)) {
      handleChange('restDays', current.filter(d => d !== dayId));
    } else {
      handleChange('restDays', [...current, dayId]);
    }
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="p-6 max-w-md mx-auto w-full space-y-6 pb-24 relative z-10 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800">设置 ⚙️</h2>

      <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6">
         
         <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">月薪 (Monthly Salary)</label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">¥</span>
                <input 
                    type="number" 
                    min="0"
                    max="10000000"
                    value={formData.monthlySalary}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                            handleChange('monthlySalary', 0);
                            return;
                        }
                        let num = Number(val);
                        if (isNaN(num)) return;
                        if (num < 0) num = 0;
                        if (num > 10000000) num = 10000000;
                        handleChange('monthlySalary', num);
                    }}
                    className="w-full p-3 pl-8 bg-gray-50 rounded-xl font-bold text-lg outline-none focus:ring-2 ring-primary/20"
                />
            </div>
         </div>

         <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">休息日 (Rest Days)</label>
            <div className="grid grid-cols-4 gap-2">
                {WEEKDAYS.map((day) => {
                    const isSelected = formData.restDays.includes(day.id);
                    return (
                        <button
                            key={day.id}
                            onClick={() => toggleRestDay(day.id)}
                            className={`p-2 rounded-lg text-sm font-bold transition-all border ${
                                isSelected 
                                ? 'bg-blue-100 border-blue-300 text-blue-600' 
                                : 'bg-gray-50 border-gray-100 text-slate-400 hover:bg-gray-100'
                            }`}
                        >
                            {day.short}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-slate-400 mt-2">Working {7 - formData.restDays.length} days / week</p>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">上班 (Start)</label>
                <input 
                    type="time" 
                    value={formData.workStartHour}
                    onChange={(e) => handleChange('workStartHour', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-lg outline-none focus:ring-2 ring-primary/20"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">下班 (End)</label>
                <input 
                    type="time" 
                    value={formData.workEndHour}
                    onChange={(e) => handleChange('workEndHour', e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl font-bold text-lg outline-none focus:ring-2 ring-primary/20"
                />
            </div>
         </div>
      </div>

      <Button fullWidth onClick={handleSave}>
        <Save className="mr-2 w-4 h-4" /> 保存修改
      </Button>

      <div className="pt-8 border-t border-gray-200">
         <Button variant="ghost" fullWidth onClick={onReset} className="text-red-500 hover:bg-red-50">
             <LogOut className="mr-2 w-4 h-4" /> 重置所有数据
         </Button>
      </div>
    </div>
  );
};