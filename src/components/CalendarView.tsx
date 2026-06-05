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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarView() {
  const { companies, todos, settings, navigateToCompany, setActiveTab } = useApp();
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

  // Check if dates match any events (including Todo tasks)
  const getEventsForDate = (date: Date) => {
    const events: { 
      id: string; 
      type: 'deadline' | 'interview' | 'intern_step' | 'todo'; 
      title: string; 
      companyName?: string; 
      companyId?: string;
      completed?: boolean;
    }[] = [];
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

    // Add matching ToDo items
    todos.forEach(todo => {
      if (todo.dueDate === dateStr) {
        events.push({
          id: `todo-${todo.id}`,
          type: 'todo',
          title: todo.title,
          completed: todo.completed
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
  const currentMonthEvents = [
    ...companies.flatMap(co => {
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
    }),
    ...todos.flatMap(todo => {
      if (todo.dueDate) {
        const d = new Date(todo.dueDate);
        if (d.getFullYear() === year && d.getMonth() === month) {
          return [{
            id: `todo-${todo.id}`,
            date: todo.dueDate,
            type: 'todo' as const,
            title: todo.title,
            completed: todo.completed
          }];
        }
      }
      return [];
    })
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-app-text-primary tracking-tight">就活カレンダー</h2>
          <p className="text-xs text-app-text-secondary mt-0.5">締め切り・面接予定・ToDoタスクを自動可視化。タップして詳細を確認できます</p>
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
        <div className="grid grid-cols-7 border-b border-app-border bg-app-bg-secondary py-3">
          {daysOfWeek.map((day, idx) => (
            <div 
              key={day} 
              className={`text-center text-xs font-black tracking-wider ${
                idx === 0 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : idx === 6 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-slate-100'
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
                        className={`text-sm font-extrabold font-mono h-6 w-6 flex items-center justify-center rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-app-calendar-selected-bg text-white font-black shadow-xs' 
                            : dateObj.getDay() === 0 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : dateObj.getDay() === 6 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-900 dark:text-slate-100'
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (evt.type === 'todo') {
                              setActiveTab('todos');
                            } else if (evt.companyId) {
                              navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview');
                            }
                          }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-sans truncate font-extrabold shadow-2xs hover:scale-[1.02] transform transition-all cursor-pointer block border ${
                            evt.type === 'deadline'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900/70'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900/70'
                                : evt.type === 'todo'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-900/70'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                          }`}
                          title={evt.type === 'todo' ? `ToDo: ${evt.title}` : `${evt.companyName} (${evt.title})`}
                        >
                          {evt.type === 'todo' 
                            ? `${evt.completed ? '✅' : '◽️'} ${evt.title}` 
                            : `${evt.type === 'deadline' ? '🚨' : evt.type === 'intern_step' ? '🎖️' : '💬'} ${evt.companyName}`}
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
                        className={`inline-block text-sm font-extrabold h-6 w-6 rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-app-calendar-selected-bg text-white flex items-center justify-center mx-auto font-black shadow-xs' 
                            : dateObj.getDay() === 0
                              ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                              : dateObj.getDay() === 6
                                ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                                : 'text-gray-900 dark:text-slate-100 font-extrabold'
                        }`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1.5 flex-1 overflow-y-auto">
                      {matchedEvents.map(evt => (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (evt.type === 'todo') {
                              setActiveTab('todos');
                            } else if (evt.companyId) {
                              navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview');
                            }
                          }}
                          className={`text-[10px] p-1.5 rounded-lg font-extrabold shadow-2xs hover:scale-102 transform transition-all cursor-pointer block border text-left ${
                            evt.type === 'deadline'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900/70'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-900/70'
                                : evt.type === 'todo'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-900/60 hover:bg-purple-200 dark:hover:bg-purple-900/70'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                          }`}
                        >
                          <div className="font-sans truncate">
                            {evt.type === 'todo' ? `${evt.completed ? '✅' : '◽️'} ${evt.title}` : evt.companyName}
                          </div>
                          <span className="text-[8px] opacity-85 font-sans font-extrabold block mt-0.5 text-gray-700 dark:text-slate-350">
                            {evt.type === 'todo' ? 'タスク' : evt.type === 'deadline' ? '書類締切' : evt.type === 'intern_step' ? 'インターン' : '面接面談'}
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
                onClick={() => {
                  if (evt.type === 'todo') {
                    setActiveTab('todos');
                  } else if (evt.companyId) {
                    navigateToCompany(evt.companyId, evt.type === 'deadline' ? 'es' : 'interview');
                  }
                }}
                className="py-3 flex items-center justify-between hover:bg-app-button-hover rounded-xl px-2 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-lg leading-none shrink-0">
                    {evt.type === 'todo' 
                      ? (evt.completed ? '✅' : '◽️') 
                      : evt.type === 'deadline' 
                        ? '🚨' 
                        : evt.type === 'intern_step' 
                          ? '🎖️' 
                          : '💬'}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold text-gray-900 dark:text-slate-100 group-hover:${theme.text} transition-colors`}>
                      {evt.type === 'todo' ? evt.title : evt.companyName}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 font-extrabold mt-0.5">
                      {evt.type === 'todo' ? 'ToDoタスク' : evt.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-gray-800 dark:text-slate-200 bg-app-bg-secondary px-2.5 py-1 rounded-lg border border-app-border">
                    {evt.date}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-app-text-secondary group-hover:text-app-text-primary transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
