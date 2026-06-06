/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// High-Fidelity Mini App Screens Rendering component for Onboarding Mockups
interface SmartphoneScreenProps {
  screenId: string;
  isDark: boolean;
  theme: any;
}

const SmartphoneScreen: React.FC<SmartphoneScreenProps> = ({ 
  screenId, 
  isDark, 
  theme
}) => {
  const bgClass = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800';

  switch (screenId) {
    case 'dashboard':
      return (
        <div className={`w-full h-full p-2.5 flex flex-col justify-start overflow-hidden select-none ${bgClass} font-sans`}>
          {/* Mock Status Bar */}
          <div className="flex justify-between items-center text-[8px] text-gray-400 dark:text-slate-500 font-mono mb-2 px-1">
            <span>09:28</span>
            <div className="flex items-center gap-1">
              <span>5G</span>
              <div className="w-3.5 h-1.5 border border-current rounded-3xs p-0.2 flex items-center">
                <div className="w-2 h-full bg-current rounded-4xs" />
              </div>
            </div>
          </div>

          {/* Miniature App Header */}
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black tracking-wider ${theme.text}`}>Berufly</span>
            <span className="text-[7px] bg-emerald-500/15 text-emerald-500 font-bold px-1 py-0.2 rounded">就活24日目</span>
          </div>

          {/* Quick Welcome Widget */}
          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-3xs border border-gray-100/10 mb-2">
            <div className="text-[7px] text-gray-400 dark:text-slate-500">今日も一歩進もう！</div>
            <div className="font-bold text-[8px] mt-0.5 truncate flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <span>👑 ゲストユーザー</span>
              <span className="text-gray-300 dark:text-slate-700 font-normal">|</span>
              <span className="text-gray-500 dark:text-slate-400 font-normal truncate max-w-[100px] italic">「絶対第一志望に内定する！」</span>
            </div>
          </div>

          {/* Mini Status Graph Ring & Stat Panels */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-3xs border border-gray-100/10 flex flex-col justify-between">
              <span className="text-[6.5px] text-gray-400 dark:text-slate-500 font-semibold">選考トータル</span>
              <div className="my-1 flex items-center justify-center relative">
                <svg className="w-10 h-10 transform -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="transparent" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="transparent" stroke="#6366f1" strokeWidth="3.5" strokeDasharray="100" strokeDashoffset="35" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-[9px] font-bold font-mono tracking-tighter">8社</span>
                </div>
              </div>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-3xs border border-gray-100/10 flex flex-col justify-between">
              <span className="text-[6.5px] text-gray-400 dark:text-slate-500 font-semibold">タスク完了率</span>
              <div className="font-bold font-mono text-center text-xs text-indigo-500 dark:text-indigo-400 my-1">
                83%
              </div>
              {/* Progress visual bar */}
              <div className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[83%]" />
              </div>
            </div>
          </div>

          {/* Target Stages Tracker Bar Chart */}
          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-3xs border border-gray-100/10 mb-2">
            <div className="text-[6.5px] text-gray-400 dark:text-slate-500 font-semibold mb-1">現在の選考フェーズ状況</div>
            <div className="space-y-1">
              <div className="space-y-0.1">
                <div className="flex justify-between text-[5.5px] text-gray-500 dark:text-slate-400">
                  <span>エントリーシート</span>
                  <span>3社</span>
                </div>
                <div className="w-full h-1 bg-gray-150 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full w-[45%]" />
                </div>
              </div>
              <div className="space-y-0.1">
                <div className="flex justify-between text-[5.5px] text-gray-500 dark:text-slate-400">
                  <span>一次・二次面接</span>
                  <span>4社</span>
                </div>
                <div className="w-full h-1 bg-gray-150 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div className="h-full bg-[#fbbf24] rounded-full w-[60%]" />
                </div>
              </div>
              <div className="space-y-0.1">
                <div className="flex justify-between text-[5.5px] text-gray-500 dark:text-slate-400">
                  <span>最終面接 / 内定！</span>
                  <span>1社</span>
                </div>
                <div className="w-full h-1 bg-gray-150 dark:bg-slate-850 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[15%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'companies':
      return (
        <div className={`w-full h-full p-2.5 flex flex-col justify-start overflow-hidden select-none ${bgClass} font-sans`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-1.5 px-0.5">
            <span className="text-[8px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-0.5">
              <Building2 className="h-2 w-2 text-indigo-500" />
              志望企業一覧 (8)
            </span>
            <span className="text-[6px] bg-indigo-500 text-white rounded-md px-1 py-0.2 font-semibold">＋ 新規追加</span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/60 p-1 rounded-md mb-2 flex items-center justify-between text-[6px] border border-gray-150/40 text-gray-400">
            <span>🔍 企業名・カナで検索...</span>
            <span className="text-[5px]">フィルター▼</span>
          </div>

          {/* Companies List Representation */}
          <div className="space-y-1.5 overflow-hidden filter blur-[0.2px]">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-4xs border border-gray-100/10 flex items-center justify-between hover:scale-95 transition-all">
              <div>
                <span className="text-[7.5px] font-bold dark:text-white truncate block">ソニーグループ株式会社</span>
                <span className="text-[5px] text-gray-400 dark:text-slate-500 block">メーカー・家電・エンタメ</span>
              </div>
              <div className="text-right">
                <span className="text-[5.5px] bg-amber-500/10 text-amber-500 border border-amber-500/10 px-1 py-0.2 rounded-md font-bold block">
                  一次面接
                </span>
                <span className="text-[4.5px] text-gray-400 block mt-0.5">次回: 6/2</span>
              </div>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-4xs border border-gray-100/10 flex items-center justify-between hover:scale-95 transition-all">
              <div>
                <span className="text-[7.5px] font-bold dark:text-white truncate block">トヨタ自動車株式会社</span>
                <span className="text-[5px] text-gray-400 dark:text-slate-500 block">メーカー・自動車</span>
              </div>
              <div className="text-right">
                <span className="text-[5.5px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 px-1 py-0.2 rounded-md font-bold block">
                  最終面接
                </span>
                <span className="text-[4.5px] text-emerald-500 font-bold block mt-0.5">👑 志望度: 特A</span>
              </div>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-4xs border border-gray-100/10 flex items-center justify-between hover:scale-95 transition-all">
              <div>
                <span className="text-[7.5px] font-bold dark:text-white truncate block">株式会社リクルート</span>
                <span className="text-[5px] text-gray-400 dark:text-slate-500 block">人材・メディア</span>
              </div>
              <div className="text-right">
                <span className="text-[5.5px] bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/10 px-1 py-0.2 rounded-md font-bold block">
                  ES提出済
                </span>
                <span className="text-[4.5px] text-gray-400 block mt-0.5">締切: 5/28</span>
              </div>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg shadow-4xs border border-gray-100/10 flex items-center justify-between hover:scale-95 transition-all opacity-60">
              <div>
                <span className="text-[7.5px] font-bold dark:text-white truncate block">株式会社サイバーエージェント</span>
                <span className="text-[5px] text-gray-400 dark:text-slate-500 block">メディア・ゲーム</span>
              </div>
              <div className="text-right">
                <span className="text-[5.5px] bg-gray-400/15 text-gray-500 border border-transparent px-1 py-0.2 rounded-md font-bold block">
                  興味あり
                </span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'calendar':
      return (
        <div className={`w-full h-full p-2.5 flex flex-col justify-start overflow-hidden select-none ${bgClass} font-sans`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] font-bold dark:text-white flex items-center gap-0.5">
              <CalendarIcon className="h-2.5 w-2.5 text-indigo-500" />
              2026年 5月
            </span>
            <div className="flex gap-0.5">
              <span className="p-0.2 hover:bg-gray-100 dark:hover:bg-slate-800 text-[5px] border rounded">◀</span>
              <span className="p-0.2 hover:bg-gray-100 dark:hover:bg-slate-800 text-[5px] border rounded">▶</span>
            </div>
          </div>

          {/* Mini Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.4 text-center font-mono text-[5.5px] text-gray-400 mb-2 border-b pb-1 border-gray-100/10">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-0.4 text-center font-mono text-[6.5px] font-bold flex-1 max-h-[140px] overflow-hidden">
            <span className="text-gray-300 dark:text-slate-800 font-normal">26</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">27</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">28</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">29</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">30</span>
            <span>1</span>
            <span className="text-blue-500">2</span>

            <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span className="text-blue-500">9</span>
            <span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span className="text-blue-500">16</span>
            <span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span className="text-blue-500">23</span>
            
            {/* Highlighting active events */}
            <span className="relative">
              <span>24</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.8 h-0.8 bg-amber-500 rounded-full" />
            </span>
            <span className="relative">
              <span>25</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.8 h-0.8 bg-emerald-500 rounded-full" />
            </span>
            <span>26</span>
            <span className="relative">
              <span>27</span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.8 h-0.8 bg-[#38bdf8] rounded-full" />
            </span>
            <span>28</span>
            
            {/* May 29th selected */}
            <span className="bg-indigo-600 text-white rounded-full flex items-center justify-center font-black relative shadow-3xs scale-105">
              <span>29</span>
              <span className="absolute bottom-0.2 left-1/2 -translate-x-1/2 w-0.8 h-0.8 bg-white rounded-full" />
            </span>
            <span className="text-blue-500">30</span>
            <span>31</span>
            
            <span className="text-gray-300 dark:text-slate-800 font-normal">1</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">2</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">3</span>
            <span className="text-gray-300 dark:text-slate-800 font-normal">4</span>
          </div>

          {/* Active selected date schedule overlay detail card */}
          <div className="p-1 bg-indigo-50/70 dark:bg-slate-900 border border-indigo-100/10 rounded-lg flex items-center justify-between text-[6.5px] mt-1.5 shadow-2xs">
            <div className="flex items-center gap-1">
              <span className="w-1 h-3.5 rounded bg-indigo-600" />
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">🕒 14:00〜 トヨタ最終面接</span>
                <span className="text-gray-500 dark:text-slate-400 text-[5px] block">最終関門: 対面面接</span>
              </div>
            </div>
            <span className="text-[5.5px] bg-red-500/10 text-red-500 px-1 py-0.1 rounded uppercase font-extrabold scale-90">必修</span>
          </div>
        </div>
      );

    case 'todo':
      return (
        <div className={`w-full h-full p-2.5 flex flex-col justify-start overflow-hidden select-none ${bgClass} font-sans`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-1.5 px-0.5">
            <span className="text-[8px] font-bold text-gray-500 dark:text-slate-400 flex items-center gap-0.5">
              <CheckSquare className="h-2 w-2 text-indigo-500" />
              Todo進捗管理
            </span>
            <span className="text-[6.5px] font-mono text-indigo-500 font-bold bg-indigo-500/10 px-1 rounded">完了: 5/6</span>
          </div>

          <div className="w-full h-1 bg-gray-150 dark:bg-slate-800 rounded-full mb-2.5 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-[83%] animate-pulse" />
          </div>

          {/* Todo Checklist details inside phone */}
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-gray-100/10 flex items-center gap-1.5 text-[7px] text-gray-400 dark:text-slate-500 line-through">
              <div className="h-3 w-3 rounded bg-emerald-500 text-white flex items-center justify-center p-0.2">
                <Check className="h-2 w-2 font-bold" />
              </div>
              <span className="truncate">「ソニーグループ」用のES志望動機添削</span>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-indigo-150/20 shadow-4xs flex items-center gap-1.5 text-[7px] text-gray-700 dark:text-slate-200 font-medium">
              <div className="h-3 w-3 rounded border border-indigo-500 flex items-center justify-center cursor-pointer p-0.2 text-indigo-500" />
              <div className="flex-1 truncate">
                <span>「トヨタ自動車」OB訪問質問案提出</span>
                <span className="text-[5.5px] text-red-500 font-bold block">🚨 今日〆</span>
              </div>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-gray-100/10 flex items-center gap-1.5 text-[7px] text-gray-400 dark:text-slate-500 line-through">
              <div className="h-3 w-3 rounded bg-emerald-500 text-white flex items-center justify-center p-0.2">
                <Check className="h-2 w-2 font-bold" />
              </div>
              <span className="truncate">自己分析シート「長所・短所」整理</span>
            </div>

            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-gray-100/10 flex items-center gap-1.5 text-[7px] text-gray-700 dark:text-slate-200 font-medium">
              <div className="h-3 w-3 rounded border border-gray-300 dark:border-slate-700 flex items-center justify-center p-0.2" />
              <div className="truncate">
                <span>自己PRビデオの録画と振り返り</span>
                <span className="text-[5.5px] text-purple-500 font-bold block">✨ 推奨タスク</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'account-select':
    default:
      return (
        <div className={`w-full h-full p-2.5 flex flex-col justify-center text-center overflow-hidden select-none ${bgClass} font-sans relative`}>
          {/* Neon Grid Overlay Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px] opacity-10" />

          <div className="z-10 space-y-2 mt-2">
            <div className="inline-flex p-1.5 bg-indigo-50 dark:bg-slate-850 rounded-xl text-indigo-500 shadow-3xs">
              <Sparkles className="h-4.5 w-4.5 animate-bounce" />
            </div>
            <h4 className="text-[10px] font-black tracking-tight dark:text-white">
              全ての機能が使えます！
            </h4>
            <p className="text-[6.5px] text-gray-400 dark:text-slate-500 max-w-[130px] mx-auto leading-relaxed">
              スマートな選考管理やカレンダー連携、タスク管理をお手軽に。
            </p>

            <div className="space-y-1.5 pt-1.5 max-w-[155px] mx-auto text-left">
              <div className="p-1 rounded-md border border-emerald-100/20 bg-emerald-500/10 text-[6px] flex items-center gap-1 text-emerald-400 font-semibold">
                <Check className="h-2 w-2 text-emerald-400 shrink-0" />
                <span className="truncate">会員登録・サインアップなし</span>
              </div>
              <div className="p-1 rounded-md border border-indigo-100/20 bg-indigo-500/10 text-[6px] flex items-center gap-1 text-indigo-400 font-semibold">
                <Check className="h-2 w-2 text-indigo-400 shrink-0" />
                <span className="truncate">実用サンプルデータ付きですぐ試せる</span>
              </div>
            </div>
            
            <div className="text-[6px] uppercase tracking-wider text-indigo-500 font-extrabold animate-pulse pt-2.5">
              Beruflyを起動しましょう！ 👇
            </div>
          </div>
        </div>
      );
  }
};

export const OnboardingModal: React.FC = () => {
  const { 
    showOnboarding, 
    setShowOnboarding, 
    startAsGuest,
    authStatus
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState(0);

  if (!showOnboarding) return null;

  const slides = [
    {
      title: 'Beruflyで就活を一元管理しよう',
      description: 'Beruflyはあなたの就職活動を全力でサポートする一元管理アプリです。複雑な選考状況やES締め切り、日々のタスクをたった一つでスマートに整頓します。',
      color: 'from-indigo-500/10 to-blue-500/10',
      tag: '就活サポーター Berufly',
      screenId: 'dashboard'
    },
    {
      title: '気になる企業を登録して選考を管理しよう',
      description: '気になる企業を「興味あり」から「内定」までの選考フェーズ（書類、一次、二次、最終）に分けて直感的に管理。面接履歴や振り返りメモ、OB訪問ログもシームレスに蓄積できます。',
      color: 'from-emerald-500/10 to-teal-500/10',
      tag: '選考管理 & 企業詳細',
      screenId: 'companies'
    },
    {
      title: '締め切りや面接日を自動でカレンダーに反映',
      description: '登録したES（エントリーシート）の締め切りや面接日程は、自動的にアプリ内カレンダーに反映。締め切り数日前や面接当日にアラームでリマインドされ、大事なチャンスを逃しません。',
      color: 'from-amber-500/10 to-orange-500/10',
      tag: 'カレンダー ＆ リマインダー',
      screenId: 'calendar'
    },
    {
      title: '日々のタスクと目標を管理して就活を加速しよう',
      description: '日・週・月ごとのタスクに分解して志望企業ごとの準備をサポート。大きな「目標」に対して進捗度を可視化でき、モチベーションを保ったまま就活を加速できます。',
      color: 'from-rose-500/10 to-red-500/10',
      tag: '強力なタスクエンジン',
      screenId: 'todo'
    },
    {
      title: 'さっそく始めよう！',
      description: '準備はすべて整いました。Beruflyを起動して、あなたの就職活動をスマートに進めましょう。',
      color: 'from-purple-500/10 to-indigo-500/10',
      tag: 'Berufly を起動する',
      screenId: 'account-select'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setCurrentSlide(slides.length - 1); // Jump to the final slide
  };

  const handleCompleteOnboarding = () => {
    if (authStatus !== 'authenticated') {
      startAsGuest();
    }
    localStorage.setItem('shukatsu_onboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-800 flex flex-col my-auto"
      >
        {/* Skip button is displayed before the final slide */}
        {currentSlide < slides.length - 1 && (
          <button 
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-55 dark:hover:bg-slate-850 z-20 cursor-pointer"
          >
            スキップ
          </button>
        )}

        <div className="flex-1 flex flex-col p-6 sm:p-8 select-none">
          {/* 1. Header description text atop the central graphic slide */}
          <div className="text-left space-y-2 mb-4">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 border border-indigo-500/10">
              {slides[currentSlide].tag}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-sans text-gray-900 dark:text-slate-100 leading-tight">
              {slides[currentSlide].title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-sans min-h-[44px]">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* 2. central / bottom viewport smartphone device preview frame */}
          <div className={`w-full py-4 rounded-2xl bg-gradient-to-br ${slides[currentSlide].color} flex items-center justify-center mb-6 border border-gray-150/40 dark:border-slate-800/10 relative overflow-hidden`}>
            
            {/* Ambient Graphic Accent elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10" />

            {/* CSS Constructed Smartphone Frame Mockup */}
            <div className="relative w-[190px] h-[330px] border-4 border-slate-900 dark:border-slate-800 rounded-[30px] bg-slate-950 shadow-xl overflow-hidden ring-4 ring-slate-900/5 flex-shrink-0 transition-transform duration-300 hover:scale-[1.02]">
              {/* Phone Camera Dot Island notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-slate-900 dark:bg-slate-900 rounded-full z-30 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-800/80 mr-2.5" />
                <div className="w-2.5 h-0.6 rounded-full bg-slate-800/60" />
              </div>

              {/* Dynamic content rendering with dark / light state capability */}
              <SmartphoneScreen 
                screenId={slides[currentSlide].screenId} 
                isDark={true} /* Always dark OLED for stunning high-tech screenshots */
                theme={{ text: 'text-indigo-400' }}
              />
            </div>
          </div>

          {/* If final slide: Render the clean action start button instead of form selectors */}
          {currentSlide === slides.length - 1 && (
            <div className="mb-4 border-t pt-4 border-gray-100 dark:border-slate-800 animate-fade-in text-center">
              <button 
                type="button"
                onClick={handleCompleteOnboarding}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Beruflyを始める</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {/* 3. Bottom Nav Controls Area: dot page indicators & simple buttons */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
            {/* Bullet Indicators (click-to-jump enabled) */}
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide 
                      ? 'w-5 bg-indigo-600 dark:bg-indigo-500' 
                      : 'w-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-indigo-300 dark:hover:bg-slate-500'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Left and Right directional arrows */}
            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <button 
                  type="button"
                  onClick={handlePrev}
                  className="p-2 border border-gray-150 dark:border-slate-750 hover:bg-gray-55 dark:hover:bg-slate-850 rounded-xl transition-colors text-gray-600 dark:text-slate-350 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}

              {currentSlide < slides.length - 1 ? (
                <button 
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 dark:bg-slate-100 dark:hover:bg-indigo-500 dark:text-slate-900 text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>次へ</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
