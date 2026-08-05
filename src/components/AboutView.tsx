import React from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Sparkles, Building2, Calendar, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutView() {
  const { settings, isDark } = useApp();
  const theme = getTheme(settings.themeColor);

  return (
    <div className="space-y-6 pb-20 text-left max-w-2xl mx-auto">
      <div>
        <h2 className={`text-xl font-black tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          Berufly（ベルフリー）について
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">就活一元管理ダッシュボードアプリ「Berufly」のご紹介</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl border shadow-xs space-y-6 leading-relaxed text-xs ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-white border-gray-100 text-gray-650'
        }`}
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-slate-200">
            Berufly は、就活生の「選考管理」と「自己分析」をスマートに一元化し、次のアクションを迷わせないために開発されたモダンな就活管理ダッシュボードアプリです。
          </p>
          <p className="leading-relaxed text-gray-700 dark:text-slate-300">
            煩雑になりがちなエントリー企業の情報や選考ステータス、日々のTodo、カレンダーのスケジュールを美しく直感的なUIで可視化。さらに、面接でそのまま使える「STARの法則」を用いたエピソード管理など、内定獲得に向けた戦略的な就活を強力にサポートします。
          </p>
          <p className="font-bold text-center pt-2 text-gray-900 dark:text-slate-150 text-sm">
            あなたのキャリアの第一歩を、Berufly と共に。
          </p>
        </div>

        {/* Feature grid to make the UI look rich and professional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-gray-100 dark:border-slate-800">
          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
            <div className="flex items-center gap-1.5 font-bold mb-1 text-gray-900 dark:text-slate-200">
              <Building2 className={`h-4 w-4 ${theme.text}`} />
              <span>スマートな選考・企業管理</span>
            </div>
            <p className="text-micro text-gray-400 dark:text-slate-400">
              本選考とインターン選考の状況、志望度、ES締め切りなどを可視化。
            </p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
            <div className="flex items-center gap-1.5 font-bold mb-1 text-gray-900 dark:text-slate-200">
              <Sparkles className={`h-4 w-4 ${theme.text}`} />
              <span>STARの法則で自己分析</span>
            </div>
            <p className="text-micro text-gray-400 dark:text-slate-400">
              Situation, Task, Action, Result に沿った説得力のあるエピソードを作成。
            </p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
            <div className="flex items-center gap-1.5 font-bold mb-1 text-gray-900 dark:text-slate-200">
              <Calendar className={`h-4 w-4 ${theme.text}`} />
              <span>スケジュールとカレンダー同期</span>
            </div>
            <p className="text-micro text-gray-400 dark:text-slate-400">
              ESの期日や面接の予定を自動的にカレンダーへ反映・一元管理。
            </p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
            <div className="flex items-center gap-1.5 font-bold mb-1 text-gray-900 dark:text-slate-200">
              <FileText className={`h-4 w-4 ${theme.text}`} />
              <span>ES・面接の振り返りメモ</span>
            </div>
            <p className="text-micro text-gray-400 dark:text-slate-400">
              選考ごとの質問回答や反省点を蓄積し、就活力を持続的にアップデート。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
