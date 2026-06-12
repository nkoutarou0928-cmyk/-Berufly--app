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
  Calendar,
  Building2
} from 'lucide-react';
import { getTheme } from '../utils/theme';
import { useApp } from '../context/AppContext';

interface BeruSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BeruSidebar({ isOpen, onClose }: BeruSidebarProps) {
  const { settings, isDark, fontSize } = useApp();
  const theme = getTheme(settings.themeColor);

  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  if (!isOpen) return null;

  const fontSizeClass = fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  const quickSearchTags = ['夏インターン', '本選考', 'IT', 'コンサル', '商社'];

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
        {/* Header Area */}
        <div className={`p-4.5 flex items-center justify-between border-b shrink-0 ${
          isDark ? 'border-slate-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-sm shrink-0 border border-white/20">
              {/* Minimalist bell character vector layout */}
              <div className="relative flex flex-col items-center">
                <Bell className="h-5.5 w-5.5 text-amber-950 fill-amber-600/30 stroke-[2.5] animate-bounce" />
                {/* Minimalist blushing eyes */}
                <div className="absolute top-[8px] flex gap-1 w-full justify-center">
                  <span className="w-1.5 h-0.5 rounded-full bg-amber-950" />
                  <span className="w-1.5 h-0.5 rounded-full bg-amber-950" />
                </div>
              </div>
            </div>
            <div className="text-left">
              <span className="text-xs font-black tracking-tight block">BERU (ベル)</span>
              <span className="text-[9px] text-gray-400 font-bold block">就活AIアシスタント</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'border-slate-800 hover:bg-slate-800 text-slate-400' 
                : 'border-gray-100 hover:bg-gray-50 text-gray-500'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5.5 scrollbar-thin">
          {/* Welcome Speech Bubble */}
          <div className="flex items-start gap-2.5">
            <div className={`p-3.5 rounded-2xl border text-xs font-bold leading-relaxed max-w-[90%] text-left relative ${
              isDark 
                ? 'bg-slate-850 border-slate-800 text-slate-200' 
                : 'bg-slate-50 border-gray-150 text-gray-700'
            }`}>
              {/* Balloon tail indicator */}
              <div className={`absolute top-4 -left-1.5 w-3 h-3 rotate-45 border-l border-b ${
                isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-gray-150'
              }`} />
              こんにちは！就活AIコンシェルジュの「BERU（ベル）」だよ！🔔
              エントリー締切のチェックや、ES作成・自己PRの添削まで、キミの就活をリアルタイムに並走するよ。何でも聞いてね！
            </div>
          </div>

          {/* 2. 就活状況アラート */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>就活状況アラート</span>
            </h3>
            <div className="p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left space-y-2">
              <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 block">
                🚨 本選考・インターン締め切り間近の企業が3社あります
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { name: 'フロンティアソリューションズ', type: '本選考ES', due: '明日 23:59まで' },
                  { name: 'スマートネクスト', type: '1dayインターン', due: '3日後' },
                  { name: '日本コンサルティンググループ', type: '本選考面接', due: '5日後' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] font-bold ${
                    isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-gray-150/70'
                  }`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="text-gray-400 shrink-0">{item.type} ( {item.due} )</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. AI企業・インターン検索 */}
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
                  placeholder="志望職種やインターンの特徴で探す..."
                  className={`w-full pl-8.5 pr-3 py-2 text-xs border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200'
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
                          ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200' 
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Dummy Cards */}
              <div className="space-y-2 pt-1">
                {[
                  { name: 'テックイノベーション', tag: 'IT / エンジニア', desc: '開発体験5Daysインターン。現場社員のメンターがサポート！', due: '締切: 6/30' },
                  { name: 'グローバルコンサルティング', tag: 'コンサル', desc: 'ロジカルシンキング養成3Days。最終日に役員へのプレゼンあり。', due: '締切: 7/5' }
                ].map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-2xl border transition-all hover:shadow-xs text-left ${
                    isDark ? 'bg-slate-950/30 border-slate-800/80 hover:bg-slate-950/50' : 'bg-gray-55/30 border-gray-100 hover:bg-gray-50/50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black">{item.name}</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-bold">{item.tag}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-relaxed font-bold mb-1.5">{item.desc}</p>
                    <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.due}
                      </span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. BERUのあなた向けおすすめ企業 */}
          <div className="space-y-2.5">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>BERUのあなた向けおすすめ企業</span>
            </h3>
            <div className="space-y-2.5 text-left">
              <span className="text-[10px] text-gray-400 dark:text-slate-400 font-bold block -mt-1">
                あなたの志望軸にマッチしたインターン・企業はここ！
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { 
                    co: 'フロンティアソリューションズ', 
                    axis: '若手から裁量権がある', 
                    reason: '新規事業立案型インターンは過去実績として満足度95%以上。アウトプット重視のカルチャーがマッチ！'
                  },
                  { 
                    co: 'スマートネクスト', 
                    axis: '技術力向上の環境', 
                    reason: 'IT業界への高い関心と、キミの自己PR「課題解決力」が求められるデータサイエンス部門の特別招待枠がマッチ。'
                  }
                ].map((rec, idx) => (
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
                    <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed font-bold pl-3 border ${
                      isDark ? 'bg-slate-900 border-slate-800/80 text-slate-300' : 'bg-white border-gray-100/60 text-gray-600'
                    }`}>
                      <span className="font-extrabold text-[9px] block text-amber-500 mb-0.5">💡 BERU's Recommend</span>
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. AI ES作成・添削 */}
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
                className={`py-3 px-3 rounded-2xl border font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/30 text-slate-250 hover:bg-slate-950/60' 
                    : 'border-indigo-100/40 bg-indigo-50/30 text-indigo-700 hover:bg-indigo-50/60'
                }`}
              >
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                <span>志望動機を作成</span>
              </button>

              <button
                type="button"
                className={`py-3 px-3 rounded-2xl border font-bold text-[11px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-3xs ${
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

          {/* 6. AI自己分析メンター */}
          <div className="space-y-2.5 pb-24">
            <h3 className={`text-xs font-extrabold flex items-center gap-1.5 text-left ${
              isDark ? 'text-slate-300' : 'text-gray-800'
            }`}>
              <BrainCircuit className="h-4 w-4 text-purple-500" />
              <span>AI自己分析メンター</span>
            </h3>
            <div className={`p-3.5 rounded-2xl border text-left text-[11px] leading-relaxed font-bold ${
              isDark ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-purple-50/10 border-purple-100/30 text-gray-650'
            }`}>
              <p className="font-extrabold text-purple-600 dark:text-purple-400 mb-0.5">🧠 BERUメンター</p>
              「キミが最も情熱を注いだプロジェクトは何？」
              「志望業界を決めた最大のきっかけを教えて」
              など、簡単な質問に答えるだけで、AIが志望動機や強みの言語化をお手伝いします！
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
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-850'
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
