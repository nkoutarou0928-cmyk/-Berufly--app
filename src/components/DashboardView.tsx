/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { 
  Building2, 
  CheckSquare, 
  Calendar, 
  Settings, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  Info,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, CompanyStatus, SelectionStage } from '../types';

export default function DashboardView() {
  const { 
    companies, 
    todos, 
    settings, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    navigateToCompany,
    setActiveTab,
    setSelectedCompanyId,
    isDark,
    selectionTypeFilter,
    setSelectionTypeFilter
  } = useApp();

  const theme = getTheme(settings.themeColor);

  const [graphMode, setGraphMode] = useState<'weekly' | 'monthly' | 'cumulative'>('cumulative');
  const [showNotifications, setShowNotifications] = useState(false);
  const [todoPeriod, setTodoPeriod] = useState<'today' | 'weekly' | 'monthly'>('weekly');

  const filteredCompanies = companies.filter(c => {
    const type = c.selectionType || 'main'; // fall back to main
    return type === selectionTypeFilter;
  });

  const isIntern = selectionTypeFilter === 'intern';

  // --- 1. Compute Statistics ---
  const totalRegistered = filteredCompanies.length;

  const esSubmittedCount = isIntern
    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'es_submitted' || c.selectionStatusIntern === 'selecting' || c.selectionStatusIntern === 'passed').length
    : filteredCompanies.filter(c => c.status === 'es_submitted' || c.status === 'selecting' || c.status === 'offered').length;

  const interviewCount = isIntern
    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'selecting' || c.selectionStatusIntern === 'passed' || c.interviewMemos.length > 0 || (c.internSteps && c.internSteps.length > 0)).length
    : filteredCompanies.filter(c => c.status === 'selecting' || c.status === 'offered' || c.interviewMemos.length > 0).length;

  const offersCount = isIntern
    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'passed').length
    : filteredCompanies.filter(c => c.status === 'offered').length;

  // --- 2. Todo completion rate ---
  const periodTodos = todos.filter(t => {
    if (todoPeriod === 'today') return t.scope === 'today';
    if (todoPeriod === 'weekly') return t.scope === 'weekly' || t.scope === 'today';
    return t.scope === 'monthly' || t.scope === 'weekly' || t.scope === 'today';
  });
  const totalPeriodCount = periodTodos.length;
  const completedPeriodCount = periodTodos.filter(t => t.completed).length;
  const periodCompletionRate = totalPeriodCount > 0 ? Math.round((completedPeriodCount / totalPeriodCount) * 100) : 0;
  const remainingPeriodCount = totalPeriodCount - completedPeriodCount;

  // Completion Rate Messages based on period
  let completionMessage = '';
  if (todoPeriod === 'today') {
    if (periodCompletionRate === 100) completionMessage = '完璧！今日のタスク全制覇！';
    else if (periodCompletionRate >= 70) completionMessage = `もう少し！残り${remainingPeriodCount}個！`;
    else if (periodCompletionRate >= 40) completionMessage = 'いい調子！引き続き頑張ろう！';
    else if (totalPeriodCount > 0) completionMessage = '今日のタスクを開始しよう！';
    else completionMessage = '今日のタスクを追加しましょう！';
  } else if (todoPeriod === 'weekly') {
    if (periodCompletionRate === 100) completionMessage = '完璧！今週も全力でした！';
    else if (periodCompletionRate >= 70) completionMessage = `順調！あと${remainingPeriodCount}個で完了！`;
    else if (periodCompletionRate >= 40) completionMessage = '折り返し！後半も頑張ろう！';
    else if (totalPeriodCount > 0) completionMessage = '今週もコツコツ進めましょう！';
    else completionMessage = '今週のタスクを追加しましょう！';
  } else {
    if (periodCompletionRate === 100) completionMessage = '完璧！今月のTodoは全制覇！';
    else if (periodCompletionRate >= 70) completionMessage = `目標間近！あと${remainingPeriodCount}個！`;
    else if (periodCompletionRate >= 40) completionMessage = '着実に前進中！頑張りましょう！';
    else if (totalPeriodCount > 0) completionMessage = '今月の目標をスタート！';
    else completionMessage = '今月のタスクを追加しましょう！';
  }

  // --- 3. Compute Funnel (本選考用) ---
  const appCount = filteredCompanies.filter(c => c.status !== 'interested').length;
  
  const docPassCount = filteredCompanies.filter(c => 
    c.selectionStage === 'document_passed' || 
    c.selectionStage === 'interview_1' || 
    c.selectionStage === 'interview_2' || 
    c.selectionStage === 'interview_final' || 
    c.selectionStage === 'offered' ||
    c.interviewMemos.length > 0
  ).length;

  const int1Count = filteredCompanies.filter(c => 
    c.selectionStage === 'interview_1' || 
    c.selectionStage === 'interview_2' || 
    c.selectionStage === 'interview_final' || 
    c.selectionStage === 'offered' ||
    c.interviewMemos.some(m => m.stageName.includes('一次') || m.stageName.includes('1') || m.stageName.includes('書類通過'))
  ).length;

  const int2Count = filteredCompanies.filter(c => 
    c.selectionStage === 'interview_2' || 
    c.selectionStage === 'interview_final' || 
    c.selectionStage === 'offered' ||
    c.interviewMemos.some(m => m.stageName.includes('二次') || m.stageName.includes('2'))
  ).length;

  const intFinalCount = filteredCompanies.filter(c => 
    c.selectionStage === 'interview_final' || 
    c.selectionStage === 'offered' ||
    c.interviewMemos.some(m => m.stageName.includes('最終') || m.stageName.includes('役員') || m.stageName.includes('3'))
  ).length;

  const naiteiCount = filteredCompanies.filter(c => c.status === 'offered' || c.selectionStage === 'offered').length;

  // Pass rates calculations
  const docPassRate = appCount > 0 ? Math.round((docPassCount / appCount) * 100) : 0;
  const int1PassRate = docPassCount > 0 ? Math.round((int1Count / docPassCount) * 100) : 0;
  const int2PassRate = int1Count > 0 ? Math.round((int2Count / int1Count) * 100) : 0;
  const intFinalPassRate = int2Count > 0 ? Math.round((intFinalCount / int2Count) * 100) : 0;
  const naiteiPassRate = intFinalCount > 0 ? Math.round((naiteiCount / intFinalCount) * 100) : 0;

  // --- 3b. Compute Funnel (インターン選考用) ---
  const appCountIntern = filteredCompanies.length;

  const esSubmittedCountIntern = filteredCompanies.filter(c => 
    c.selectionStatusIntern === 'es_submitted' || 
    c.selectionStatusIntern === 'selecting' || 
    c.selectionStatusIntern === 'passed'
  ).length;

  const selectingCountIntern = filteredCompanies.filter(c => 
    c.selectionStatusIntern === 'selecting' || 
    c.selectionStatusIntern === 'passed'
  ).length;

  const passedCountIntern = filteredCompanies.filter(c => 
    c.selectionStatusIntern === 'passed'
  ).length;

  const internEsSubmittedRate = appCountIntern > 0 ? Math.round((esSubmittedCountIntern / appCountIntern) * 100) : 0;
  const internSelectingRate = esSubmittedCountIntern > 0 ? Math.round((selectingCountIntern / esSubmittedCountIntern) * 100) : 0;
  const internPassedRate = selectingCountIntern > 0 ? Math.round((passedCountIntern / selectingCountIntern) * 100) : 0;

  // --- 4. Goal Tracker ---
  const goals = todos.filter(t => t.scope === 'goal');

  // --- 5. Prior week message ---
  const trendES = 3;
  const trendTodoDiff = 15;
  const trendTodoRate = 85;

  // Unread badge count
  const unreadNotifs = notifications.filter(n => !n.read);

  // Handler for custom graphics tapping to filter companies
  const handleGraphBarClick = (status: CompanyStatus | string) => {
    setActiveTab('companies');
  };

  const getFormattedToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const w = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];
    return `${y}年${m}月${d}日(${w})`;
  };
  return (
    <div className="space-y-6 pb-20 text-left">

      {/* Top Welcome Bar */}
      <div className="p-4 rounded-3xl border border-app-card-border bg-app-card-bg flex items-center justify-between transition-all shadow-3xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
          <h2 className="text-base font-bold tracking-tight text-app-text-primary font-sans">
            {getFormattedToday()}
          </h2>
          {filteredCompanies.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-app-bg-secondary text-app-text-primary border border-app-border font-sans">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-505" />
              <span>先週の振り返り: ES提出+{trendES}社 | Todo達成率{trendTodoRate}% (+{trendTodoDiff}%)</span>
            </div>
          )}
        </div>

        {/* Notification Bell Badge on Top Right */}
        <div className="relative">
          <button 
            id="notif_badge_btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-app-button-border bg-app-button-bg hover:bg-app-button-hover text-app-button-text transition-all cursor-pointer relative shadow-3xs"
          >
            <Bell className={`h-5 w-5 ${unreadNotifs.length > 0 ? theme.text : 'text-app-text-secondary'}`} />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 block h-4 w-4 bg-rose-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Simulated In-App Push Notifications Overlay Box */}
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-app-card-bg rounded-2xl shadow-xl border border-app-card-border z-55 overflow-hidden"
                >
                  <div className="p-3 bg-app-bg-secondary border-b border-app-border flex items-center justify-between">
                    <span className="text-sm font-bold text-app-text-primary">通知センター（Simulated）</span>
                    {unreadNotifs.length > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className={`text-xs font-semibold ${theme.text} hover:underline cursor-pointer`}
                      >
                        すべて既読
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-app-border">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-app-text-secondary">通知はありません</div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            markNotificationRead(notif.id);
                            setShowNotifications(false);
                            if (notif.targetCompanyId) {
                              navigateToCompany(notif.targetCompanyId, notif.type === 'es_deadline' ? 'es' : 'interview');
                            } else if (notif.targetTodoId) {
                              setActiveTab('todos');
                            }
                          }}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-app-button-hover ${!notif.read ? 'bg-app-bg-secondary/60' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">
                              {notif.type === 'es_deadline' && <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-500" />}
                              {notif.type === 'interview' && <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />}
                              {notif.type === 'todo' && <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{notif.title}</p>
                              <p className="text-[11px] text-gray-655 dark:text-slate-350 line-clamp-2 mt-0.5">{notif.message}</p>
                              <span className="text-[9px] text-gray-455 dark:text-slate-500 font-mono mt-1 block">{notif.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selection Type Switcher (本選考 vs インターン選考) */}
      <div className="p-1.5 rounded-2xl border border-app-card-border bg-app-card-bg flex items-center justify-between gap-4 transition-all shadow-3xs">
        <div className="pl-2 flex items-center gap-1.5">
          <Sparkles className={`h-4.5 w-4.5 ${theme.text}`} />
          <span className="text-xs font-bold font-sans text-app-text-secondary">
            {selectionTypeFilter === 'intern' ? 'インターン選考のサマリーを表示中' : '本選考のサマリーを表示中'}
          </span>
        </div>
        <div className="flex p-0.5 rounded-xl border border-app-border bg-app-bg-secondary text-xs font-sans">
          <button
            type="button"
            onClick={() => setSelectionTypeFilter('main')}
            className={`py-1.5 px-3.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectionTypeFilter === 'main'
                ? 'bg-app-card-bg text-app-text-primary shadow-xs'
                : 'text-app-text-secondary hover:text-app-text-primary'
            }`}
          >
            本選考
          </button>
          <button
            type="button"
            onClick={() => setSelectionTypeFilter('intern')}
            className={`py-1.5 px-3.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectionTypeFilter === 'intern'
                ? 'bg-app-card-bg text-app-text-primary shadow-xs'
                : 'text-app-text-secondary hover:text-app-text-primary'
            }`}
          >
            インターン選考
          </button>
        </div>
      </div>

      {/* --- Top Indicators Grid (4 metrics) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setActiveTab('companies')}
          className="bg-app-card-bg p-4 rounded-2xl border border-app-card-border hover:bg-app-button-hover transition-all cursor-pointer relative group overflow-hidden shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text-secondary">エントリー社数</span>
            <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{totalRegistered}</span>
            <span className="text-xs text-app-text-secondary font-sans">社</span>
          </div>
          <div className="text-[10px] text-app-text-secondary mt-1 flex items-center gap-0.5 truncate">
            <span>Interest / ES / Selecting</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('companies')}
          className="bg-app-card-bg p-4 rounded-2xl border border-app-card-border hover:bg-app-button-hover transition-all cursor-pointer relative group overflow-hidden shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text-secondary">ES提出数</span>
            <Award className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">{esSubmittedCount}</span>
            <span className="text-xs text-app-text-secondary font-sans">社</span>
          </div>
          <div className="text-[10px] text-app-text-secondary mt-1 flex items-center gap-0.5 truncate">
            <span>（提出完了および選考中）</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('companies')}
          className="bg-app-card-bg p-4 rounded-2xl border border-app-card-border hover:bg-app-button-hover transition-all cursor-pointer relative group overflow-hidden shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text-secondary">面接実施（進行）</span>
            <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{interviewCount}</span>
            <span className="text-xs text-app-text-secondary font-sans">社</span>
          </div>
          <div className="text-[10px] text-app-text-secondary mt-1 flex items-center gap-0.5 truncate">
            <span>面接予定・実績のある企業</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('companies')}
          className="bg-app-card-bg p-4 rounded-2xl border border-app-card-border hover:bg-app-button-hover transition-all cursor-pointer relative group overflow-hidden shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-text-secondary">内定獲得数</span>
            <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-bounce" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono text-yellow-600 dark:text-yellow-400">{offersCount}</span>
            <span className="text-xs text-app-text-secondary font-sans">社</span>
          </div>
          <div className="text-[10px] text-app-text-secondary mt-1 flex items-center gap-0.5 truncate">
            <span>（内定および内々定）</span>
          </div>
        </div>
      </div>

      {/* --- Second Grid: Achievement rate & Mode switcher Graph --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Todo Completion Progress Widget */}
        <div className="md:col-span-5 bg-app-card-bg p-5 rounded-3xl border border-app-card-border shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5 text-[13px]">
                <CheckSquare className={`h-4.5 w-4.5 ${theme.text}`} />
                Todo達成率 ({todoPeriod === 'today' ? '今日' : todoPeriod === 'weekly' ? '今週' : '今月'})
              </h3>
              <p className="text-[10px] text-app-text-secondary mt-0.5">
                {todoPeriod === 'today' ? '今日のタスク集計' : todoPeriod === 'weekly' ? '今日と今週のタスク集計' : '今日・今週・今月のタスク集計'}
              </p>
            </div>
            
            {/* Period Toggle Buttons */}
            <div className="flex p-0.5 bg-app-bg-secondary rounded-lg text-[9px] font-sans font-bold self-start sm:self-center border border-app-border">
              {[
                { id: 'today', label: '今日' },
                { id: 'weekly', label: '今週' },
                { id: 'monthly', label: '今月' }
              ].map(btn => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setTodoPeriod(btn.id as any)}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer border-0 ${
                    todoPeriod === btn.id 
                      ? 'bg-app-card-bg text-app-text-primary shadow-xs' 
                      : 'text-app-text-secondary hover:text-app-text-primary bg-transparent'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="my-5 flex flex-col items-center justify-center">
            {/* SVG Interactive Circular progress */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-app-border fill-transparent"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="fill-transparent"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke={theme.hex}
                  initial={{ strokeDasharray: "301.6", strokeDashoffset: "301.6" }}
                  animate={{ strokeDashoffset: 301.6 - (301.6 * periodCompletionRate) / 100 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 80 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <motion.span 
                  key={periodCompletionRate}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-black font-mono text-app-text-primary"
                >
                  {periodCompletionRate}%
                </motion.span>
                <span className="text-[10px] text-app-text-secondary font-medium">{completedPeriodCount} / {totalPeriodCount} 完了</span>
              </div>
            </div>

            <div className={`mt-3 px-3.5 py-1.5 rounded-full ${theme.lightBg} text-center`}>
              <p className={`text-xs font-bold ${theme.text}`}>{completionMessage}</p>
            </div>
          </div>

          <div className="border-t border-app-border pt-3 text-[11px] text-app-text-secondary flex justify-between">
            <span>完了: {completedPeriodCount}件</span>
            <span>残タスク: {remainingPeriodCount}件</span>
          </div>
        </div>

        {/* --- Action Funnel Visual (選考フロー図) --- */}
        <div className="md:col-span-7 bg-app-card-bg p-5 rounded-2xl md:rounded-3xl border border-app-card-border shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-center justify-between border-b border-app-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5">
                <TrendingUp className={`h-4.5 w-4.5 ${theme.text}`} />
                選考フロー図 (ファネル表示)
              </h3>
              <p className="text-[11px] text-app-text-secondary mt-0.5">
                ステージごとの企業数と、次のステージへの通過率 (%) を自動集計
              </p>
            </div>
            <span className="text-[10px] font-bold text-app-text-secondary font-mono">Simulated Funnel</span>
          </div>

          {/* Funnel Layers */}
          <div className="mt-5 space-y-2.5 max-w-lg mx-auto w-full flex-1 flex flex-col justify-center">
            {isIntern ? (
              <>
                {/* Stage 1: Intern Entry */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-blue-50 hover:bg-blue-100 border border-blue-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-blue-800 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      1. エントリー
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{appCountIntern} 社</span>
                  </div>
                </div>

                {/* Pass rate 1 -> 2 */}
                {appCountIntern > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      ES提出率: {internEsSubmittedRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 2: Intern ES submitted */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-amber-50 hover:bg-amber-100 border border-amber-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      2. ES・書類提出済
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{esSubmittedCountIntern} 社</span>
                  </div>
                </div>

                {/* Pass rate 2 -> 3 */}
                {esSubmittedCountIntern > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      選考進出率: {internSelectingRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 3: Intern Selecting */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                      3. 面接・選考中
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{selectingCountIntern} 社</span>
                  </div>
                </div>

                {/* Pass rate 3 -> 4 */}
                {selectingCountIntern > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold text-yellow-600 px-2 py-0.5 bg-yellow-50 rounded-md font-mono`}>
                      合格率: {internPassedRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 4: Intern Passed */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-yellow-50 hover:bg-yellow-105 border border-yellow-300 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-yellow-900 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                      4. 合格・参加決定 🎉
                    </span>
                    <span className="font-mono font-black text-yellow-700 group-hover:scale-105 transition-transform">{passedCountIntern} 社</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Stage 1: Entry */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-blue-50 hover:bg-blue-100 border border-blue-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-blue-800 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      1. 応募 (ES予定含む)
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{appCount} 社</span>
                  </div>
                </div>

                {/* Pass rate 1 -> 2 */}
                {appCount > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      書類通過率: {docPassRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 2: Doc pass */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-amber-50 hover:bg-amber-100 border border-amber-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-amber-800 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      2. 書類通過
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{docPassCount} 社</span>
                  </div>
                </div>

                {/* Pass rate 2 -> 3 */}
                {docPassCount > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      一次面接通過率: {int1PassRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 3: Interview 1 */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                      3. 一次面接
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{int1Count} 社</span>
                  </div>
                </div>

                {/* Pass rate 3 -> 4 */}
                {int1Count > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      二次面接通過率: {int2PassRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 4: Interview 2 */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-indigo-800 flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 bg-indigo-500 rounded-full" />
                      4. 二次面接
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{int2Count} 社</span>
                  </div>
                </div>

                {/* Pass rate 4 -> 5 */}
                {int2Count > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className={`text-[10px] font-bold ${theme.textDark} px-2.5 py-0.5 ${theme.lightBg} rounded-md font-mono`}>
                      最終面接進出率: {intFinalPassRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 5: Final Interview */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-purple-50 hover:bg-purple-100 border border-purple-200/50 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-purple-800 flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 bg-purple-500 rounded-full" />
                      5. 最終面接
                    </span>
                    <span className="font-mono font-black text-gray-900 group-hover:scale-105 transition-transform">{intFinalCount} 社</span>
                  </div>
                </div>

                {/* Pass rate 5 -> 6 */}
                {intFinalCount > 0 && (
                  <div className="flex items-center justify-center gap-1 py-0.5">
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                    <span className="text-[10px] font-bold text-yellow-600 px-2 py-0.5 bg-yellow-50 rounded-md font-mono">
                      内定率: {naiteiPassRate}%
                    </span>
                    <div className="h-4 w-px bg-dashed border-l border-gray-300" />
                  </div>
                )}

                {/* Stage 6: Offered */}
                <div className="space-y-1">
                  <div 
                    onClick={() => setActiveTab('companies')}
                    className="flex items-center justify-between text-xs cursor-pointer group bg-yellow-50 hover:bg-yellow-105 border border-yellow-300 p-2.5 rounded-xl transition-all"
                  >
                    <span className="font-bold text-yellow-900 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                      6. 内定 🎉
                    </span>
                    <span className="font-mono font-black text-yellow-700 group-hover:scale-105 transition-transform">{naiteiCount} 社</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- Dynamic Shukatsu Chart Mode Switcher (就活サマリー指標) --- */}
      <div className="bg-app-card-bg p-5 rounded-3xl border border-app-card-border shadow-xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-amber-500" />
              就活サマリー指標
            </h3>
            <p className="text-[11px] text-app-text-secondary mt-0.5">応募社数・ES・面接・内定の数</p>
          </div>
          
          {/* Toggle Modes */}
          <div className="flex p-0.5 bg-app-bg-secondary rounded-lg text-[11px] border border-app-border">
            <button 
              onClick={() => setGraphMode('weekly')}
              className={`py-1 px-3.5 rounded-md font-semibold transition-all cursor-pointer ${graphMode === 'weekly' ? 'bg-app-card-bg shadow-xs text-app-text-primary' : 'text-app-text-secondary hover:text-app-text-primary'}`}
            >
              週表示 (棒)
            </button>
            <button 
              onClick={() => setGraphMode('monthly')}
              className={`py-1 px-3.5 rounded-md font-semibold transition-all cursor-pointer ${graphMode === 'monthly' ? 'bg-app-card-bg shadow-xs text-app-text-primary' : 'text-app-text-secondary hover:text-app-text-primary'}`}
            >
              月表示 (線)
            </button>
            <button 
              onClick={() => setGraphMode('cumulative')}
              className={`py-1 px-3.5 rounded-md font-semibold transition-all cursor-pointer ${graphMode === 'cumulative' ? 'bg-app-card-bg shadow-xs text-app-text-primary' : 'text-app-text-secondary hover:text-app-text-primary'}`}
            >
              累計カード
            </button>
          </div>
        </div>

        {/* Graph Content Area */}
        <div className="flex-1 mt-6 min-h-[140px] flex items-center justify-center">
          {graphMode === 'weekly' && (
            <div className="w-full flex flex-col justify-end space-y-4">
              <div className="flex items-end justify-between px-4 h-24 pt-4 border-b border-gray-100">
                {/* Category bars representing count */}
                <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handleGraphBarClick(isIntern ? 'entry_done' : 'es_planned')}>
                  <span className="text-[10px] font-bold font-mono text-blue-500 mb-1 group-hover:scale-110 transition-transform">
                    {isIntern 
                      ? filteredCompanies.filter(c => c.selectionStatusIntern === 'entry_done').length
                      : filteredCompanies.filter(c => c.status === 'es_planned' || c.status === 'interested').length
                    }
                  </span>
                  <div 
                    className="w-8 bg-blue-400 rounded-t-md hover:bg-blue-500 transition-all font-sans" 
                    style={{ 
                      height: `${Math.max(12, Math.min(80, (
                        (isIntern 
                          ? filteredCompanies.filter(c => c.selectionStatusIntern === 'entry_done').length
                          : filteredCompanies.filter(c => c.status === 'es_planned' || c.status === 'interested').length
                        ) / Math.max(1, totalRegistered)) * 80))}px` 
                    }}
                  />
                  <span className="text-[10px] text-gray-500 font-sans mt-1">
                    {isIntern ? 'エントリー済' : '興味/予定'}
                  </span>
                </div>

                <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handleGraphBarClick('es_submitted')}>
                  <span className="text-[10px] font-bold font-mono text-amber-500 mb-1 group-hover:scale-110 transition-transform">
                    {isIntern 
                      ? filteredCompanies.filter(c => c.selectionStatusIntern === 'es_submitted').length
                      : filteredCompanies.filter(c => c.status === 'es_submitted').length
                    }
                  </span>
                  <div 
                    className="w-8 bg-yellow-400 rounded-t-md hover:bg-yellow-500 transition-all font-sans" 
                    style={{ 
                      height: `${Math.max(12, Math.min(80, (
                        (isIntern 
                          ? filteredCompanies.filter(c => c.selectionStatusIntern === 'es_submitted').length
                          : filteredCompanies.filter(c => c.status === 'es_submitted').length
                        ) / Math.max(1, totalRegistered)) * 80))}px` 
                    }}
                  />
                  <span className="text-[10px] text-gray-500 font-sans mt-1">ES提出済</span>
                </div>

                <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handleGraphBarClick('selecting')}>
                  <span className="text-[10px] font-bold font-mono text-emerald-500 mb-1 group-hover:scale-110 transition-transform">
                    {isIntern 
                      ? filteredCompanies.filter(c => c.selectionStatusIntern === 'selecting').length
                      : filteredCompanies.filter(c => c.status === 'selecting').length
                    }
                  </span>
                  <div 
                    className="w-8 bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-all font-sans" 
                    style={{ 
                      height: `${Math.max(12, Math.min(80, (
                        (isIntern 
                          ? filteredCompanies.filter(c => c.selectionStatusIntern === 'selecting').length
                          : filteredCompanies.filter(c => c.status === 'selecting').length
                        ) / Math.max(1, totalRegistered)) * 80))}px` 
                    }}
                  />
                  <span className="text-[10px] text-gray-500 font-sans mt-1 font-sans">選考中</span>
                </div>

                <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handleGraphBarClick(isIntern ? 'passed' : 'offered')}>
                  <span className="text-[10px] font-bold font-mono text-yellow-600 mb-1 group-hover:scale-110 transition-transform">
                    {isIntern 
                      ? filteredCompanies.filter(c => c.selectionStatusIntern === 'passed').length
                      : filteredCompanies.filter(c => c.status === 'offered').length
                    }
                  </span>
                  <div 
                    className="w-8 bg-yellow-500 rounded-t-md hover:bg-yellow-600 transition-all font-sans" 
                    style={{ 
                      height: `${Math.max(12, Math.min(80, (
                        (isIntern 
                          ? filteredCompanies.filter(c => c.selectionStatusIntern === 'passed').length
                          : filteredCompanies.filter(c => c.status === 'offered').length
                        ) / Math.max(1, totalRegistered)) * 80))}px` 
                    }}
                  />
                  <span className="text-[10px] text-gray-500 font-sans mt-1">
                    {isIntern ? '合格' : '内定'}
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-[10px]">
                <span className="flex items-center gap-1 text-gray-500 font-sans">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                  {isIntern ? 'エントリー (青)' : '興味 (青)'}
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-sans">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                  ES (黄)
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-sans">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  面接 (緑)
                </span>
                <span className="flex items-center gap-1 text-gray-500 font-sans">
                  <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
                  {isIntern ? '合格 (金)' : '内定 (金)'}
                </span>
              </div>
            </div>
          )}

          {graphMode === 'monthly' && (
            <div className="w-full flex flex-col justify-end">
              <div className="relative w-full h-24 px-2 flex items-end">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <path
                    d="M 10 70 Q 80 50 150 40 T 290 15"
                    fill="none"
                    stroke={theme.hex}
                    strokeWidth="3.5"
                  />
                  <circle cx="10" cy="70" r="4" fill={theme.hex} />
                  <circle cx="100" cy="55" r="4" fill={theme.hex} />
                  <circle cx="200" cy="30" r="4" fill={theme.hex} />
                  <circle cx="290" cy="15" r="4" fill={theme.hex} />
                </svg>
                <div className="flex justify-between w-full text-[9px] text-gray-400 font-mono mt-1 px-1">
                  <span>3月 (エントリー開始)</span>
                  <span>4月 (ES提出ピーク)</span>
                  <span>5月 (面接・選考)</span>
                  <span>6月 (内定期)</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <Info className="h-3.5 w-3.5 text-gray-450" />
                <p className="text-[10px] text-gray-500">
                  選考は5月中旬を境に書類審査から個別面接ステージへと推移しています。
                </p>
              </div>
            </div>
          )}

          {graphMode === 'cumulative' && (
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <div 
                onClick={() => setActiveTab('companies')} 
                className="p-3 bg-blue-50/40 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-blue-600">
                  {isIntern ? 'エントリー済み' : 'エントリー興味あり'}
                </div>
                <div className="text-sm font-black font-mono text-blue-950 mt-1">
                  {isIntern
                    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'entry_done').length
                    : filteredCompanies.filter(c => c.status === 'interested').length
                  } 社
                </div>
              </div>
              
              <div 
                onClick={() => setActiveTab('companies')} 
                className="p-3 bg-yellow-50/40 hover:bg-yellow-50 border border-yellow-100 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-amber-700">
                  {isIntern ? 'ES提出済' : '提出予定のES'}
                </div>
                <div className="text-sm font-black font-mono text-amber-955 mt-1">
                  {isIntern
                    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'es_submitted').length
                    : filteredCompanies.filter(c => c.status === 'es_planned').length
                  } 社
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('companies')} 
                className="p-3 bg-emerald-50/40 hover:bg-emerald-50 border border-emerald-100 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-emerald-700">
                  {isIntern ? '選考中の企業' : '面接選考中の企業'}
                </div>
                <div className="text-sm font-black font-mono text-emerald-950 mt-1">
                  {isIntern
                    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'selecting').length
                    : filteredCompanies.filter(c => c.status === 'selecting').length
                  } 社
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('companies')} 
                className="p-3 bg-rose-50/40 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all cursor-pointer"
              >
                <div className="text-[10px] font-bold text-rose-700">
                  {isIntern ? '不合格・落選' : '不合格/選考終了'}
                </div>
                <div className="text-sm font-black font-mono text-rose-955 mt-1">
                  {isIntern
                    ? filteredCompanies.filter(c => c.selectionStatusIntern === 'rejected').length
                    : filteredCompanies.filter(c => c.status === 'rejected').length
                  } 社
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Goals Progress Bar Card Section --- */}
      <div className="bg-app-card-bg p-5 rounded-3xl border border-app-card-border shadow-xs text-left">
        <h3 className="text-sm font-bold text-app-text-primary flex items-center gap-1.5 border-b border-app-border pb-3">
          <Award className={`h-4.5 w-4.5 ${theme.text}`} />
          現在の就活目標達成率
        </h3>

        <div className="mt-4 space-y-4">
          {goals.length === 0 ? (
            <div className="py-4 text-center text-xs text-gray-400 dark:text-slate-500">
              目標はまだ登録されていません。「Todoリスト」タブの一番下で目標を設定してみましょう！
            </div>
          ) : (
            goals.map(goal => {
              const subs = goal.subtasks || [];
              const finished = subs.filter(s => s.completed).length;
              const rate = subs.length > 0 ? Math.round((finished / subs.length) * 100) : 0;

              return (
                <div key={goal.id} className="space-y-1.5 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-slate-850/50 border border-gray-50 dark:border-slate-800 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 dark:text-slate-200">{goal.title}</span>
                    <span className={`font-mono font-bold ${theme.textDark}`}>{rate}% ({finished}/{subs.length})</span>
                  </div>
                  {/* Progress bar container */}
                  <div className="w-full bg-gray-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${theme.bg}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
