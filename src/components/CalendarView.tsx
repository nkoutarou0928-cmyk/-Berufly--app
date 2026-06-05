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

  // Next/Previous week
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
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

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
          <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">就活カレンダー</h2>
          <p className="text-xs text-[#222222] dark:text-white mt-0.5 font-black">締め切り・面接予定・ToDoタスクを自動可視化。タップして詳細を確認できます</p>
        </div>
        
        {/* Toggle View Mode */}
        <div className="flex p-0.5 bg-gray-150 dark:bg-slate-950 rounded-lg text-xs self-start border border-[#CCCCCC] dark:border-slate-700">
          <button 
            onClick={() => setViewMode('month')}
            className={`py-1.5 px-3 rounded-md font-black transition-all cursor-pointer ${viewMode === 'month' ? 'bg-white dark:bg-slate-800 shadow-xs text-[#222222] dark:text-white' : 'text-gray-700 dark:text-slate-350 hover:text-black dark:hover:text-white'}`}
          >
            月表示
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`py-1.5 px-3 rounded-md font-black transition-all cursor-pointer ${viewMode === 'week' ? 'bg-white dark:bg-slate-800 shadow-xs text-[#222222] dark:text-white' : 'text-gray-700 dark:text-slate-350 hover:text-black dark:hover:text-white'}`}
          >
            週表示
          </button>
        </div>
      </div>

      {/* Navigation and Date Title banner */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-[#CCCCCC] dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5">
          <Calendar className={`h-4.5 w-4.5 ${theme.text}`} />
          <span className="font-mono font-black">{year}年 {monthNames[month]}</span>
        </h3>

        <div className="flex items-center gap-1">
          <button
            onClick={viewMode === 'month' ? handlePrevMonth : handlePrevWeek}
            className="p-1.5 bg-white dark:bg-slate-800 border border-[#CCCCCC] dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-[#222222] dark:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-[10px] font-black text-[#222222] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer border border-transparent"
          >
            今月
          </button>
          <button
            onClick={viewMode === 'month' ? handleNextMonth : handleNextWeek}
            className="p-1.5 bg-white dark:bg-slate-800 border border-[#CCCCCC] dark:border-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-750 transition-colors cursor-pointer text-[#222222] dark:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Calendar Grid / Week view */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#CCCCCC] dark:border-slate-700 shadow-xs overflow-hidden">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#CCCCCC] dark:border-slate-700 bg-gray-50 dark:bg-[#090A0C] py-3">
          {daysOfWeek.map((day, idx) => (
            <div 
              key={day} 
              className={`text-center text-xs font-black tracking-wider ${
                idx === 0 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : idx === 6 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-[#222222] dark:text-white'
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
              className="grid grid-cols-7 divide-x divide-y divide-[#CCCCCC] dark:divide-slate-700 border-t border-[#CCCCCC] dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {daysGrid.map((dateObj, idx) => {
                if (!dateObj) {
                  return <div key={`empty-${idx}`} className="bg-gray-50 dark:bg-[#090A0C] min-h-[90px]" />;
                }

                const dayNum = dateObj.getDate();
                const matchedEvents = getEventsForDate(dateObj);
                
                const isCurrentSimulatedToday = isToday(dateObj);

                return (
                  <div 
                    key={dateObj.toISOString()} 
                    className={`min-h-[95px] p-1.5 flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-slate-850/50 transition-colors relative bg-white dark:bg-slate-900 ${
                      isCurrentSimulatedToday ? 'ring-2 ring-inset ring-indigo-600 dark:ring-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className={`text-sm font-black font-mono h-6 w-6 flex items-center justify-center rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-indigo-600 text-white font-black shadow-xs dark:bg-indigo-500' 
                            : dateObj.getDay() === 0 
                              ? 'text-rose-600 dark:text-rose-400 font-black' 
                              : dateObj.getDay() === 6 
                                ? 'text-blue-600 dark:text-blue-400 font-black' 
                                : 'text-[#222222] dark:text-white'
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
                              ? 'bg-rose-100 border-rose-300 text-black dark:bg-rose-950/80 dark:border-rose-800 dark:text-white hover:bg-rose-200 dark:hover:bg-rose-900/80'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-100 border-amber-300 text-black dark:bg-amber-950/80 dark:border-amber-800 dark:text-white hover:bg-amber-200 dark:hover:bg-amber-900/80'
                                : evt.type === 'todo'
                                  ? 'bg-purple-100 border-purple-300 text-black dark:bg-purple-950/80 dark:border-purple-800 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-900/80'
                                  : 'bg-blue-100 border-blue-300 text-black dark:bg-blue-950/80 dark:border-blue-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-900/80'
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
              className="grid grid-cols-7 divide-x divide-[#CCCCCC] dark:divide-slate-700 min-h-[160px] bg-white dark:bg-slate-900"
            >
              {weekDaysGrid.map(dateObj => {
                const dayNum = dateObj.getDate();
                const matchedEvents = getEventsForDate(dateObj);
                
                const isCurrentSimulatedToday = isToday(dateObj);

                return (
                  <div 
                    key={dateObj.toISOString()} 
                    className={`p-2 flex flex-col hover:bg-gray-50 dark:hover:bg-slate-850/50 transition-colors bg-white dark:bg-slate-900 ${
                      isCurrentSimulatedToday ? 'ring-2 ring-inset ring-indigo-600 dark:ring-indigo-500' : ''
                    }`}
                  >
                    <div className="text-center font-mono py-1">
                      <span className="text-[10px] block text-[#222222] dark:text-white mb-0.5 font-black">
                        {daysOfWeek[dateObj.getDay()]}
                      </span>
                      <span 
                        className={`inline-block text-sm font-black h-6 w-6 rounded-full ${
                          isCurrentSimulatedToday 
                            ? 'bg-indigo-600 text-white flex items-center justify-center mx-auto font-black shadow-xs dark:bg-indigo-500' 
                            : dateObj.getDay() === 0
                              ? 'text-rose-600 dark:text-rose-400 font-black'
                              : dateObj.getDay() === 6
                                ? 'text-blue-600 dark:text-blue-400 font-black'
                                : 'text-[#222222] dark:text-white font-black'
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
                              ? 'bg-rose-100 border-rose-300 text-black dark:bg-rose-950/80 dark:border-rose-800 dark:text-white hover:bg-rose-200 dark:hover:bg-rose-900/80'
                              : evt.type === 'intern_step'
                                ? 'bg-amber-100 border-amber-300 text-black dark:bg-amber-950/80 dark:border-amber-800 dark:text-white hover:bg-amber-200 dark:hover:bg-amber-900/80'
                                : evt.type === 'todo'
                                  ? 'bg-purple-100 border-purple-300 text-black dark:bg-purple-950/80 dark:border-purple-800 dark:text-white hover:bg-purple-200 dark:hover:bg-purple-900/80'
                                  : 'bg-blue-100 border-blue-300 text-black dark:bg-blue-950/80 dark:border-blue-800 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-900/80'
                          }`}
                        >
                          <div className="font-sans truncate">
                            {evt.type === 'todo' ? `${evt.completed ? '✅' : '◽️'} ${evt.title}` : evt.companyName}
                          </div>
                          <span className="text-[8px] opacity-90 font-sans font-extrabold block mt-0.5 text-gray-800 dark:text-slate-200">
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-[#CCCCCC] dark:border-slate-700 shadow-xs">
        <h3 className="text-sm font-bold text-black dark:text-white flex items-center gap-1.5 border-b border-[#CCCCCC] dark:border-slate-700 pb-3">
          <Calendar className={`h-4.5 w-4.5 ${theme.text}`} />
          <span>今月のスケジュール・締切一覧</span>
          <span className={`text-xs font-bold font-mono text-black dark:text-white bg-gray-50 dark:bg-slate-950 px-2 py-0.5 rounded-full ml-1 border border-[#CCCCCC] dark:border-slate-700`}>
            {currentMonthEvents.length}件
          </span>
        </h3>

        <div className="mt-4 divide-y divide-[#CCCCCC] dark:divide-slate-700">
          {currentMonthEvents.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-800 dark:text-gray-250">
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
                    <p className={`text-xs font-extrabold text-black dark:text-white group-hover:${theme.text} transition-colors`}>
                      {evt.type === 'todo' ? evt.title : evt.companyName}
                    </p>
                    <p className="text-[10px] text-gray-800 dark:text-slate-200 font-extrabold mt-0.5">
                      {evt.type === 'todo' ? 'ToDoタスク' : evt.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-black dark:text-white bg-gray-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-[#CCCCCC] dark:border-slate-700">
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
