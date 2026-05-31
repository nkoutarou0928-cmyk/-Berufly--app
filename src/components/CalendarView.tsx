/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  AlertCircle,
  Clock,
  Briefcase,
  Flag,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarView() {
  const { companies, settings, navigateToCompany } = useApp();
  const theme = getTheme(settings.themeColor);

  // States
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const today = new Date();
  const isToday = (date: Date) => {
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Set default initial calendar focus around current date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Helpers for Month Grid calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

  // Days in month
  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  // First day of month (0-6)
  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const totalDays = getDaysInMonth(year, month);
  const startDayIndex = getFirstDayOfMonth(year, month);

  // Create Days array for grid
  const daysGrid: (Date | null)[] = [];
  for (let i = 0; i < startDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(new Date(year, month, d));
  }

  // Next/Previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if dates match any events
  const getEventsForDate = (date: Date) => {
    const events: { id: string; type: 'deadline' | 'interview' | 'intern_step'; title: string; companyName: string; companyId: string }[] = [];
    const dateStr = date.toISOString().split('T')[0];

    companies.forEach(company => {
      const isIntern = company.selectionType === 'intern';
      if (company.esDeadline === dateStr) {
        events.push({
          id: `dl-${company.id}`,
          type: 'deadline',
          title: isIntern ? 'インターンES締切' : 'ES締切',
          companyName: company.name,
          companyId: company.id
        });
      }
      if (company.interviewDate === dateStr) {
        events.push({
          id: `int-${company.id}`,
          type: 'interview',
          title: isIntern ? 'インターン面接' : '面接',
          companyName: company.name,
          companyId: company.id
        });
      }
      // Add intern steps
      if (isIntern && company.internSteps) {
        company.internSteps.forEach(step => {
          if (step.date === dateStr) {
            events.push({
              id: `step-${step.id}`,
              type: 'intern_step',
              title: step.stepName,
              companyName: company.name,
              companyId: company.id
            });
          }
        });
      }
    });

    return events;
  };

  // Week Mode Calculation
  // Showing the week that has the currentDate
  const startOfWeek = new Date(currentDate);
  const diff = currentDate.getDay();
  startOfWeek.setDate(currentDate.getDate() - diff); // move back to Sunday

  const weekDaysGrid: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDaysGrid.push(d);
  }

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  // All events compiled in chronological order in current month to show as list beneath of calendar
  const currentMonthEvents = companies.flatMap(co => {
    const res = [];
    const isIntern = co.selectionType === 'intern';
    const labelPrefix = isIntern ? '【インターン】' : '';
    
    if (co.esDeadline) {
      const d = new Date(co.esDeadline);
      if (d.getFullYear() === year && d.getMonth() === month) {
        res.push({
          id: `dl-${co.id}`,
          date: co.esDeadline,
          type: 'deadline' as const,
          companyId: co.id,
          companyName: co.name,
          title: `${labelPrefix}ES募集締切日`
        });
      }
    }
    if (co.interviewDate) {
      const d = new Date(co.interviewDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        res.push({
          id: `int-${co.id}`,
          date: co.interviewDate,
          type: 'interview' as const,
          companyId: co.id,
          companyName: co.name,
          title: `${labelPrefix}選考・面接日程`
        });
      }
    }
    if (isIntern && co.internSteps) {
      co.internSteps.forEach(step => {
        if (step.date) {
          const d = new Date(step.date);
          if (d.getFullYear() === year && d.getMonth() === month) {
            res.push({
              id: `step-${step.id}`,
              date: step.date,
              type: 'intern_step' as const,
              companyId: co.id,
              companyName: co.name,
              title: `【インターン選考】${step.stepName}`
            });
          }
        }
      });
    }
    return res;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-app-text-primary tracking-tight">就活カレンダー</h2>
          <p className="text-xs text-app-text-secondary mt-0.5">締め切りと面接日程を自動可視化。タップして詳細を編集できます</p>
        </div>
        
        {/* Toggle View Mode */}
        <div className="flex p-0.5 bg-app-bg-secondary rounded-lg text-xs self-start border border-app-border">
          <button 
            onClick={() => setViewMode('month')}
            className={`py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer ${viewMode === 'month' ? 'bg-app-card-bg shadow-xs text-app-text-primary' : 'text-app-text-secondary hover:text-app-text-primary'}`}
          >
            月表示
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`py-1.5 px-3 rounded-md font-semibold transition-all cursor-pointer ${viewMode === 'week' ? 'bg-app-card-bg shadow-xs text-app-text-primary' : 'text-app-text-secondary hover:text-app-text-primary'}`}
          >
            週表示
          </button>
        </div>
      </div>

      {/* Navigation and Date Title banner */}
      <div className="flex items-center justify-between bg-app-card-bg px-4 py-3 rounded-2xl border border-app-card-border shadow-xs">
        <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5">
          <Calendar className={`h-4.5 w-4.5 ${theme.text}`} />
          <span className="font-mono font-black">{year}年 {monthNames[month]}</span>
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
            className="p-1.5 bg-app-button-bg border border-app-button-border rounded-lg hover:bg-app-button-hover transition-colors cursor-pointer text-app-button-text"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[10px] font-bold text-app-button-text hover:bg-app-button-hover rounded-lg transition-colors cursor-pointer border border-transparent"
          >
            今月
          </button>
          <button
            onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
            className="p-1.5 bg-app-button-bg border border-app-button-border rounded-lg hover:bg-app-button-hover transition-colors cursor-pointer text-app-button-text"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Grid / Week view */}
      <div className="bg-app-card-bg rounded-3xl border border-app-card-border shadow-xs overflow-hidden">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-app-border bg-app-bg-secondary py-2.5">
          {daysOfWeek.map((day, idx) => (
            <div 
              key={day} 
              className={`text-center text-[10px] font-bold ${
                idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-app-text-secondary'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <AnimatePresence mode="wait">
          {viewMode === 'month' ? (
            <motion.div 
              key="month-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-7 divide-x divide-y divide-app-border border-t border-app-border bg-app-card-bg"
            >
              {daysGrid.map((dateObj, idx) => {
                if (!dateObj) {
                  return <div key={`empty-${idx}`} className="bg-app-bg-secondary/40 min-h-[90px]" />;
                }

                const dayNum = dateObj.getDate();
                const matchedEvents = getEventsForDate(dateObj);
                
                const isCurrentSimulatedToday = isToday(dateObj);

                return (
                  <div 
                    key={dateObj.toISOString()} 
                    className={`min-h-[95px] p-1.5 flex flex-col justify-between hover:bg-app-button-hover transition-colors group relative ${
                      isCurrentSimulatedToday ? 'bg-app-calendar-today-bg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-xs font-bold font-mono h-5 w-5 flex items-center justify-center rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-app-calendar-selected-bg text-app-calendar-selected-text font-semibold' 
                            : dateObj.getDay() === 0 
                              ? 'text-rose-500' 
                              : dateObj.getDay() === 6 
                                ? 'text-blue-500' 
                                : 'text-app-text-primary'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    {/* Events block */}
                    <div className="mt-1.5 space-y-1 z-10">
                      {matchedEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview')}
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-sans truncate font-bold shadow-2xs hover:scale-[1.02] transform transition-all cursor-pointer block border ${
                            evt.type === 'deadline'
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          }`}
                          title={`${evt.companyName} (${evt.title})`}
                        >
                          {evt.type === 'deadline' ? '🚨' : evt.type === 'intern_step' ? '🎖️' : '💬'} {evt.companyName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="week-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-7 divide-x divide-app-border min-h-[160px] bg-app-card-bg"
            >
              {weekDaysGrid.map(dateObj => {
                const dayNum = dateObj.getDate();
                const matchedEvents = getEventsForDate(dateObj);
                
                const isCurrentSimulatedToday = isToday(dateObj);

                return (
                  <div 
                    key={dateObj.toISOString()} 
                    className={`p-2 flex flex-col hover:bg-app-button-hover transition-colors ${
                      isCurrentSimulatedToday ? 'bg-app-calendar-today-bg' : ''
                    }`}
                  >
                    <div className="text-center font-mono py-1">
                      <span className="text-[10px] block text-app-text-secondary mb-0.5 font-bold">
                        {daysOfWeek[dateObj.getDay()]}
                      </span>
                      <span 
                        className={`inline-block text-xs font-black h-5.5 w-5.5 rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-app-calendar-selected-bg text-app-calendar-selected-text flex items-center justify-center mx-auto font-semibold' 
                            : dateObj.getDay() === 0
                              ? 'text-rose-500'
                              : dateObj.getDay() === 6
                                ? 'text-blue-500'
                                : 'text-app-text-primary'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 flex-1 overflow-y-auto">
                      {matchedEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={() => navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview')}
                          className={`text-[9px] p-1.5 rounded-lg font-bold shadow-2xs hover:scale-102 transform transition-all cursor-pointer block border text-left ${
                            evt.type === 'deadline'
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                : 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                          }`}
                        >
                          <div className="font-sans truncate">{evt.companyName}</div>
                          <span className="text-[8px] opacity-70 font-sans block mt-0.5 text-app-text-secondary">
                            {evt.type === 'deadline' ? '書類締切' : evt.type === 'intern_step' ? 'インターン' : '面接面談'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Details lists for current selected month */}
      <div className="bg-app-card-bg p-5 rounded-3xl border border-app-card-border shadow-xs">
        <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5 border-b border-app-border pb-3">
          <Calendar className={`h-4.5 w-4.5 ${theme.text}`} />
          <span>今月のスケジュール・締切一覧</span>
          <span className={`text-xs font-bold font-mono ${theme.textDark} ${theme.lightBg} px-2 py-0.5 rounded-full ml-1 dark:bg-slate-850 dark:text-slate-200`}>
            {currentMonthEvents.length}件
          </span>
        </h3>

        <div className="mt-4 divide-y divide-app-border">
          {currentMonthEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-app-text-secondary">
              今月の予定はありません。企業ディテールから「ES締切日」や「面接予定」を設定してみましょう
            </div>
          ) : (
            currentMonthEvents.map(evt => (
              <div 
                key={evt.id}
                onClick={() => navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview')}
                className="py-3 flex items-center justify-between hover:bg-app-button-hover rounded-xl px-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg">
                    {evt.type === 'deadline' ? '🚨' : evt.type === 'intern_step' ? '🎖️' : '💬'}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold text-app-text-primary group-hover:${theme.text} transition-colors`}>
                      {evt.companyName}
                    </p>
                    <p className="text-[10px] text-app-text-secondary mt-0.5">
                      {evt.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-app-button-text bg-app-bg-secondary px-2.5 py-1 rounded-lg border border-app-border">
                    {evt.date}
                  </span>
                  <ChevronRight className="h-4 w-4 text-app-text-secondary group-hover:text-app-text-primary transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
