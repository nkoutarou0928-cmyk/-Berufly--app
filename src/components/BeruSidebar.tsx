/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Bell, 
  Search, 
  Sparkles, 
  FileEdit, 
  BrainCircuit, 
  Send, 
  ChevronRight, 
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { getTheme } from '../utils/theme';
import { useApp } from '../context/AppContext';

interface BeruSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BeruSidebar({ isOpen, onClose }: BeruSidebarProps) {
  const { settings, isDark, fontSize, companies, selectionTypeFilter } = useApp();
  const theme = getTheme(settings.themeColor);

  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // 1. 就活状況アラートのフィルタリング (3日以内)
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  const activeAlerts: { id: string; name: string; type: string; due: string; color: string }[] = [];

  companies.forEach((co) => {
    if (co.esDeadline) {
      const target = new Date(co.esDeadline);
      if (!isNaN(target.getTime())) {
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 3) {
          const dayLabel = diffDays === 0 ? '今日' : diffDays === 1 ? '明日' : diffDays === 2 ? '2日後' : `${diffDays}日後`;
          const timeStr = co.esDeadline.includes(' ') ? co.esDeadline.split(' ')[1] : '23:59';
          activeAlerts.push({
            id: `es-${co.id}`,
            name: co.name,
            type: co.selectionType === 'intern' ? 'インターンES' : '本選考ES',
            due: `ES締切: ${dayLabel} ${timeStr}`,
            color: co.selectionType === 'intern'
              ? 'text-amber-650 bg-amber-50/60 dark:bg-amber-950/20 dark:text-amber-400'
              : 'text-red-500 bg-red-50/60 dark:bg-red-950/20 dark:text-red-400'
          });
        }
      }
    }
    if (co.interviewDate) {
      const target = new Date(co.interviewDate);
      if (!isNaN(target.getTime())) {
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 3) {
          const dayLabel = diffDays === 0 ? '今日' : diffDays === 1 ? '明日' : diffDays === 2 ? '2日後' : `${diffDays}日後`;
          let timePart = '';
          const parts = co.interviewDate.split(/[ T]/);
          if (parts[1]) {
            timePart = parts[1].substring(0, 5);
          }
          activeAlerts.push({
            id: `interview-${co.id}`,
            name: co.name,
            type: co.selectionType === 'intern' ? 'インターン面接' : '本選考面接',
            due: `面接: ${dayLabel} ${timePart}`.trim(),
            color: 'text-blue-500 bg-blue-50/60 dark:bg-blue-950/20 dark:text-blue-400'
          });
        }
      }
    }
  });

  // 2. タブ連動用データ定義
  const isIntern = selectionTypeFilter === 'intern';

  const quickSearchTags = isIntern
    ? ['夏インターン', '1day', '長期インターン', 'IT', 'コンサル']
    : ['本選考', 'IT', 'コンサル', '商社', 'メーカー'];

  const searchPlaceholder = isIntern
    ? 'インターンの特徴や職種で探す...'
    : '企業名や職種、特徴で探す...';

  const dummySearchCards = isIntern
    ? [
        { name: 'テックイノベーション', tag: 'IT / インターン募集', desc: '開発体験5Days。現場最前線のシニアエンジニアがメンターとして密着並走！プロダクト開発のリアルを体験。', due: '締切: 6/30' },
        { name: 'グローバルコンサルティング', tag: 'コンサル / インターン募集', desc: '戦略提案型3Daysワーク。最終日に役員陣へ直接プレゼンテーション、優秀者は早期本選考ルート確約。', due: '締切: 7/5' }
      ]
    : [
        { name: 'フロンティアソリューションズ', tag: 'IT / 本選考', desc: '本選考直結型のエントリー開始！若手から裁量権を持って活躍可能な職場環境。早期選考ルートあり。', due: '締切: 6/20' },
        { name: 'スマートネクスト', tag: 'コンサル / 本選考', desc: '総合コンサルタント職の本選考エントリー。論理的課題解決スキルやプレゼン能力が試されます。', due: '締切: 6/25' }
      ];

  const recommendationsTitle = isIntern
    ? 'あなたにおすすめのインターンシップ募集'
    : 'あなたの志望軸にマッチした本選考はここ！';

  const recommendationCards = isIntern
    ? [
        { 
          co: 'フロンティアソリューションズ', 
          axis: '若手から裁量権がある', 
          reason: '最先端のプロダクト開発体験インターンは過去実績満足度98%！キミの分析スキルをアピールする絶好の機会です。'
        },
        { 
          co: 'スマートネクスト', 
          axis: '技術力向上の環境', 
          reason: 'IT業界への高い関心と、自己PRの「課題解決力」が活きるデータサイエンス部門の早期特別インターンシップへの優待オファー枠。'
        }
      ]
    : [
        { 
          co: 'フロンティアソリューションズ', 
          axis: '若手から裁量権がある', 
          reason: '新規事業立案型選考は満足度95%以上。若手が積極的にアイデアをカタチにできるカルチャーがキミの自己分析結果とマッチ！'
        },
        { 
          co: 'スマートネクスト', 
          axis: '技術力向上の環境', 
          reason: '本選考データサイエンティスト職。キミの強みである「課題解決力」がまさに活きる環境です。'
        },
        {
          co: '日本コンサルティンググループ',
          axis: 'ロジカル思考力を活かす',
          reason: 'ロジカル思考を重視する風土。自己PRに記載された「ゼミの課題分析経験」で磨いた問題構造化能力を発揮できます。'
        }
      ];

  return (
    <>
      {/* Backdrop with elegant blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-xs z-40"
      />

      {/* Slide-in sidebar drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] border-l flex flex-col z-50 shadow-2xl transition-colors duration-200 ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : 'bg-white border-gray-150 text-gray-900'
        }`}
      >
        {/* ① BERUのヘッダーエリア */}
        <div className={`p-4 flex items-center gap-3 border-b shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'
        }`}>
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
            {/* Cute bell character with round background */}
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-md shrink-0 border border-white/20">
              <div className="relative flex flex-col items-center">
                <Bell className="h-6 w-6 text-amber-950 fill-amber-500/40 stroke-[2] animate-bounce" />
                {/* Minimalist blushing eyes and mouth */}
                <div className="absolute top-[9px] flex gap-1 w-full justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-950 flex items-center justify-center relative">
                    <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-950 flex items-center justify-center relative">
                    <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
                  </span>
                </div>
                {/* Cute smile */}
                <div className="absolute top-[16px] w-2.5 h-1.5 border-b-2 border-amber-950 rounded-b-full" />
              </div>
              {/* Cute little red cheeks */}
              <div className="absolute top-[13px] left-1.5 w-1.5 h-0.5 rounded-full bg-rose-400/85" />
              <div className="absolute top-[13px] right-1.5 w-1.5 h-0.5 rounded-full bg-rose-400/85" />
            </div>

            {/* Speech bubble */}
            <div className={`p-2.5 rounded-2xl border text-[11px] font-bold leading-normal relative text-left flex-1 ${
              isDark 
                ? 'bg-slate-850 border-slate-800 text-slate-205' 
                : 'bg-purple-50/60 border-purple-100/60 text-purple-950'
            }`}>
              {/* Balloon tail indicator pointing left */}
              <div className={`absolute top-4.5 -left-1 w-2 h-2 rotate-45 border-l border-b ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-purple-50/60 border-purple-100/60'
              }`} />
              こんにちは、BERUです！インターンや本選考の相談に乗るよ！
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
              isDark 
                ? 'border-slate-800 hover:bg-slate-800 text-slate-400' 
                : 'border-gray-150 hover:bg-gray-100 text-gray-550'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-5.5 scrollbar-thin ${fontSizeClass}`}>
          
          {/* ②【📊 就活状況アラート】 */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>就活状況アラート</span>
            </h3>
            <div className="p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left space-y-2.5">
              <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                {activeAlerts.length > 0 
                  ? `🚨 本選考・インターン締め切り間近の選考が ${activeAlerts.length} 件あります`
                  : `✅ 現在、直近の締め切りアラートはありません`}
              </span>
              {activeAlerts.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {activeAlerts.map((item, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] font-bold transition-all hover:scale-[1.01] ${
                      isDark ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900' : 'bg-white border-gray-150/70 hover:bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black ${item.color}`}>
                          {item.type}
                        </span>
                        <span className="text-gray-400 dark:text-slate-400 font-medium font-mono">{item.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-[10px] font-bold text-gray-450 dark:text-slate-450">
                  現在、直近の締め切りアラートはありません
                </div>
              )}
            </div>
          </div>

          {/* ③【🔍 AI企業・インターン検索】 */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <Search className={`h-4 w-4 ${theme.text}`} />
              <span>AI企業・インターン検索</span>
            </h3>
            <div className="space-y-2.5 text-left">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-8.5 pr-3 py-2 text-xs border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white font-bold' : 'bg-gray-55 border-gray-200 text-gray-800 font-bold'
                  }`}
                />
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {quickSearchTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                      searchQuery === tag
                        ? `${theme.bg} text-white border-transparent`
                        : isDark 
                          ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-205' 
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Dummy Cards */}
              <div className="space-y-2 pt-1">
                {dummySearchCards.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border transition-all hover:shadow-xs text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                    isDark ? 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-950/50' : 'bg-gray-55/30 border-gray-150/70 hover:bg-gray-55'
                  }`}
                  onClick={() => alert(`${item.name} の選考詳細（ダミー動作）`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black">{item.name}</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-bold">{item.tag}</span>
                    </div>
                    <p className="text-[10px] text-gray-550 dark:text-slate-400 leading-relaxed font-bold mb-1.5">{item.desc}</p>
                    <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1 font-bold text-rose-500">
                        <Calendar className="h-3 w-3" />
                        {item.due}
                      </span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ④【💡 BERUのあなた向けおすすめ企業】 */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              <span>BERUのあなた向けおすすめ企業</span>
            </h3>
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold block -mt-1">
                {recommendationsTitle}
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {recommendationCards.map((rec, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border space-y-1.5 relative overflow-hidden ${
                    isDark ? 'bg-slate-850/40 border-slate-800' : 'bg-indigo-50/20 border-indigo-100/35'
                  }`}>
                    {/* Glowing side accent line */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${theme.bg}`} />
                    
                    <div className="flex items-center justify-between pl-1">
                      <span className="text-xs font-black">{rec.co}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm ${
                        isDark ? 'bg-slate-800 text-amber-400' : `${theme.lightBg} ${theme.text}`
                      }`}>
                        軸: {rec.axis}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed font-bold pl-3 border relative ${
                      isDark ? 'bg-slate-900 border-slate-800/80 text-slate-300' : 'bg-white border-gray-100/60 text-gray-650'
                    }`}>
                      <span className="font-extrabold text-[9px] block text-amber-500 mb-0.5">💡 BERU's Recommend</span>
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⑤【📝 AI ES作成・添削】 */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <FileEdit className={`h-4 w-4 ${theme.text}`} />
              <span>AI ES作成・添削</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => alert('志望動機の作成を開始します（フェーズ1 モックアップのためダミー動作です）')}
                className={`py-3 px-3 rounded-2xl border font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs hover:scale-102 hover:shadow-2xs ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/30 text-slate-250 hover:bg-slate-950/60' 
                    : 'border-indigo-100/40 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-50/60'
                }`}
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                <span>志望動機を作成</span>
              </button>

              <button
                type="button"
                onClick={() => alert('自己PRの添削を開始します（フェーズ1 モックアップのためダミー動作です）')}
                className={`py-3 px-3 rounded-2xl border font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs hover:scale-102 hover:shadow-2xs ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/30 text-slate-250 hover:bg-slate-950/60' 
                    : 'border-indigo-100/40 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-50/60'
                }`}
              >
                <BrainCircuit className={`h-4.5 w-4.5 ${theme.text}`} />
                <span>自己PRを添削</span>
              </button>
            </div>
          </div>

          {/* ⑥【🧠 AI自己分析メンター】 */}
          <div className="space-y-2.5 pb-24">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <BrainCircuit className="h-4 w-4 text-purple-500" />
              <span>AI自己分析メンター</span>
            </h3>
            
            <div className="space-y-3">
              {/* BERU Speech Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-250 flex items-center justify-center shadow-xs border border-white/10 shrink-0">
                  <Bell className="h-4.5 w-4.5 text-amber-950 fill-amber-500/20 stroke-[1.8]" />
                </div>
                <div className={`p-3.5 rounded-2xl border text-[11px] font-bold text-left relative max-w-[80%] ${
                  isDark 
                    ? 'bg-slate-850 border-slate-800 text-slate-205' 
                    : 'bg-purple-50/20 border-purple-100/35 text-gray-700'
                }`}>
                  <div className={`absolute top-3 -left-1 w-2.5 h-2.5 rotate-45 border-l border-b ${
                    isDark ? 'bg-slate-850 border-slate-800' : 'bg-purple-50/20 border-purple-100/35'
                  }`} />
                  <p className="font-extrabold text-purple-600 dark:text-purple-400 mb-1">🧠 BERUメンター</p>
                  自己分析をお手伝いします！これまでに最も熱中した出来事や、就活で不安に思っていることを何でも教えてね！
                </div>
              </div>

              {/* 優しく光る「BERUが考え中... 🔔」ローディングアニメーション */}
              <div className="flex items-start gap-2.5 justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-250 flex items-center justify-center shadow-xs border border-white/10 shrink-0">
                  <Bell className="h-4.5 w-4.5 text-amber-950 fill-amber-500/20 stroke-[1.8] animate-bounce" />
                </div>
                <div className={`p-3.5 rounded-2xl text-[11px] font-bold border max-w-[80%] text-left relative ${
                  isDark 
                    ? 'bg-slate-850 border-slate-800 text-slate-400' 
                    : 'bg-purple-50/10 border-purple-100/30 text-gray-400'
                }`}>
                  <div className={`absolute top-3 -left-1 w-2.5 h-2.5 rotate-45 border-l border-b ${
                    isDark ? 'bg-slate-850 border-slate-800' : 'bg-purple-50/10 border-purple-100/30'
                  }`} />
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                    <span className="text-[9px] font-black ml-1 text-purple-600 dark:text-purple-400 animate-pulse">BERUが考え中... 🔔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input Area (Fixed Bottom) */}
        <div className={`p-4 border-t shrink-0 absolute bottom-0 left-0 right-0 z-10 transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150'
        }`}>
          <form 
            onSubmit={e => {
              e.preventDefault();
              if (chatMessage.trim()) {
                alert(`「${chatMessage}」を送信しました（フェーズ1 モックアップのためダミー送信です）`);
                setChatMessage('');
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              placeholder="BERUに就活の相談をする..."
              className={`flex-1 px-3.5 py-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white font-bold' : 'bg-gray-50 border-gray-200 text-gray-850 font-bold'
              }`}
            />
            <button
              type="submit"
              className={`p-2.5 rounded-xl text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${theme.bg} ${theme.hover}`}
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );
}
