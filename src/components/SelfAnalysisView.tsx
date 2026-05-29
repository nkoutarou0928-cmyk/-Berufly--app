/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  FileText, 
  Briefcase, 
  MessageSquare,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SelfAnalysisView() {
  const { 
    selfAnalysis, 
    updateSelfPR, 
    updateGakuchika, 
    addBaseMotivation, 
    updateBaseMotivation, 
    deleteBaseMotivation, 
    addFAQ, 
    updateFAQ, 
    deleteFAQ, 
    settings, 
    isDark 
  } = useApp();

  const theme = getTheme(settings.themeColor);

  // View States
  const [subTab, setSubTab] = useState<'profile' | 'motivation' | 'faq'>('profile');

  // Form States for Motivation Base
  const [isAddingMotivation, setIsAddingMotivation] = useState(false);
  const [motivationIdToEdit, setMotivationIdToEdit] = useState<string | null>(null);
  const [motivationIndustry, setMotivationIndustry] = useState('');
  const [motivationOccupation, setMotivationOccupation] = useState('');
  const [motivationContent, setMotivationContent] = useState('');

  // Form States for FAQs
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
  const [faqIdToEdit, setFaqIdToEdit] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Count helper
  const prLength = selfAnalysis.selfPR?.length || 0;
  const gakuchikaLength = selfAnalysis.gakuchika?.length || 0;

  // Question presets helper
  const questionPresets = [
    '自己PRをお願いします。',
    '学生時代に最も力を入れたことは何ですか？',
    '就職活動における「企業選びの軸」について教えてください。',
    'あなたの「最大の強み」と「弱み」は何ですか？',
    'これまでで一番大きな挫折経験とそれを乗り越えた方法を教えてください。',
    '5年後、10年後に入社して挑戦したいこと（キャリアプラン）はありますか？',
    '周囲からどんな人だと言われますか？（他己分析の視点）'
  ];

  // Save/Add Handlers
  const handleSaveMotivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivationIndustry || !motivationContent) return;

    if (motivationIdToEdit) {
      updateBaseMotivation(motivationIdToEdit, {
        industry: motivationIndustry,
        occupation: motivationOccupation,
        content: motivationContent
      });
      setMotivationIdToEdit(null);
    } else {
      addBaseMotivation({
        industry: motivationIndustry,
        occupation: motivationOccupation,
        content: motivationContent
      });
      setIsAddingMotivation(false);
    }
    setMotivationIndustry('');
    setMotivationOccupation('');
    setMotivationContent('');
  };

  const startEditMotivation = (id: string, industry: string, occupation: string, content: string) => {
    setMotivationIdToEdit(id);
    setMotivationIndustry(industry);
    setMotivationOccupation(occupation);
    setMotivationContent(content);
    setIsAddingMotivation(true);
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion || !faqAnswer) return;

    if (faqIdToEdit) {
      updateFAQ(faqIdToEdit, {
        question: faqQuestion,
        answer: faqAnswer
      });
      setFaqIdToEdit(null);
    } else {
      addFAQ({
        question: faqQuestion,
        answer: faqAnswer
      });
      setIsAddingFAQ(false);
    }
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const startEditFAQ = (id: string, q: string, a: string) => {
    setFaqIdToEdit(id);
    setFaqQuestion(q);
    setFaqAnswer(a);
    setIsAddingFAQ(true);
  };

  const cancelMotivationForm = () => {
    setIsAddingMotivation(false);
    setMotivationIdToEdit(null);
    setMotivationIndustry('');
    setMotivationOccupation('');
    setMotivationContent('');
  };

  const cancelFAQForm = () => {
    setIsAddingFAQ(false);
    setFaqIdToEdit(null);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Title Banner */}
      <div>
        <h2 className={`text-xl font-bold tracking-tight font-sans flex items-center gap-1.5 ${
          isDark ? 'text-slate-100' : 'text-gray-900'
        }`}>
          <Sparkles className={`h-5 w-5 ${theme.text}`} />
          自己分析・就活の軸マスター
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          自己PR、ガクチカ、業界別志望動機、よく聞かれる面接質問の回答を整理・一元管理します
        </p>
      </div>

      {/* Styled Tabs Switcher */}
      <div className={`flex p-1 rounded-2xl overflow-x-auto gap-0.5 border transition-all ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-gray-100/70 border-gray-100'
      }`}>
        {[
          { id: 'profile' as const, label: '自己PR・ガクチカ', icon: Award },
          { id: 'motivation' as const, label: '志望動機のベース', icon: Briefcase },
          { id: 'faq' as const, label: '想定質問と回答(FAQ)', icon: MessageSquare }
        ].map(item => {
          const isSelected = subTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSubTab(item.id);
                // Clear active states
                cancelMotivationForm();
                cancelFAQForm();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 text-center py-2.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected 
                  ? `${isDark ? 'bg-slate-800 text-slate-150 border border-slate-700/60' : `${theme.lightBg} ${theme.textDark} border border-${settings.themeColor}-100`} shadow-2xs` 
                  : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-950'}`
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-VIEW CONTENTS */}
      <div className="space-y-5">
        
        {/* TAB 1: 自己PR & ガクチカ */}
        {subTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* 自己PR Section */}
            <div className={`p-5 rounded-3xl border shadow-3xs space-y-4 transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`p-1.5 rounded-lg ${theme.lightBg} ${theme.text} dark:bg-slate-800 dark:text-slate-200`}>
                    <Award className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>自己PR Sheet</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">あなたの強みや、ビジネスシーンで再現できる長所を磨きます</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-gray-400">
                  <span className={`font-bold text-xs ${prLength > 400 ? 'text-rose-550' : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>{prLength}</span> / 400 文字目安
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={selfAnalysis.selfPR || ''}
                  onChange={e => updateSelfPR(e.target.value)}
                  rows={6}
                  maxLength={1500}
                  placeholder="私の強みは【主体的解決力】です。大学時代、サークル活動にて～"
                  className={`w-full p-3.5 text-xs rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 leading-relaxed font-sans ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-150' : 'bg-gray-50/70 border-gray-200 text-gray-800'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <span>💡 企業が読みやすい「結論ファースト」で構成するのがポイントです。</span>
                  {prLength > 0 && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5 dark:text-emerald-400 font-mono animate-fade-in">
                      <Check className="h-3 w-3" />
                      自動保存完了
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ガクチカ Section */}
            <div className={`p-5 rounded-3xl border shadow-3xs space-y-4 transition-all ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-center justify-between border-b pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`p-1.5 rounded-lg ${theme.lightBg} ${theme.text} dark:bg-slate-800 dark:text-slate-200`}>
                    <Bookmark className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>学生時代に最も力を入れたこと（ガクチカ）</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">目標達成の動機、立ちはだかった困難、具体的なアクション、最終的な学びを整理します</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[10px] text-gray-400">
                  <span className={`font-bold text-xs ${gakuchikaLength > 400 ? 'text-rose-550' : (isDark ? 'text-slate-300' : 'text-gray-700')}`}>{gakuchikaLength}</span> / 400 文字目安
                </div>
              </div>

              <div className="space-y-2">
                <textarea
                  value={selfAnalysis.gakuchika || ''}
                  onChange={e => updateGakuchika(e.target.value)}
                  rows={6}
                  maxLength={1500}
                  placeholder="学生時代に最も注力したことは、サークル代表としての新規会員獲得です。当初～"
                  className={`w-full p-3.5 text-xs rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 leading-relaxed font-sans ${
                    isDark ? 'bg-slate-800 border-slate-700 text-slate-150' : 'bg-gray-50/70 border-gray-200 text-gray-800'
                  }`}
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <span>💡 STARフレーム（状況・目標・行動・結果）に従うと相手に伝わりやすくなります。</span>
                  {gakuchikaLength > 0 && (
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5 dark:text-emerald-400 font-mono animate-fade-in">
                      <Check className="h-3 w-3" />
                      自動保存完了
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: 志望動機のベース */}
        {subTab === 'motivation' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Header with trigger button */}
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-bold block ${isDark ? 'text-slate-350' : 'text-gray-500'}`}>
                  保存済みのベース動機: {selfAnalysis.baseMotivations?.length || 0}件
                </span>
              </div>
              
              {!isAddingMotivation && (
                <button
                  type="button"
                  onClick={() => setIsAddingMotivation(true)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 flex items-center gap-1 ${theme.bg} text-white shadow-xs`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  新規動機テンプレートを作成
                </button>
              )}
            </div>

            {/* Editing / Creating Card form */}
            <AnimatePresence>
              {isAddingMotivation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-5 rounded-3xl border shadow-xs space-y-4 transition-all overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-250'
                  }`}
                >
                  <h4 className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    <Plus className="h-4 w-4" />
                    {motivationIdToEdit ? 'ベース志望動機の編集' : '新規ベース志望動機の作成'}
                  </h4>

                  <form onSubmit={handleSaveMotivation} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-650'}`}>
                          業界区分（必須）
                        </label>
                        <input
                          type="text"
                          required
                          value={motivationIndustry}
                          onChange={e => setMotivationIndustry(e.target.value)}
                          placeholder="例: IT・ソフトウェア, 金融, 食品メーカ"
                          className={`w-full text-xs p-2 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                            isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-55/70 border-gray-200 text-gray-800'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-650'}`}>
                          志望職種・フィールド（任意）
                        </label>
                        <input
                          type="text"
                          value={motivationOccupation}
                          onChange={e => setMotivationOccupation(e.target.value)}
                          placeholder="例: システムコンサルタント, 企画総合職"
                          className={`w-full text-xs p-2 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                            isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-55/70 border-gray-200 text-gray-800'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-650'}`}>
                        志望方向・根本動機の内容（必須）
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={motivationContent}
                        onChange={e => setMotivationContent(e.target.value)}
                        placeholder="業界を志望する根本的な理由や、なぜ自分がこの仕事に熱意を持てるのかの体験と理由を記述します。"
                        className={`w-full text-xs p-3 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 leading-relaxed ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-150' : 'bg-gray-55/70 border-gray-200 text-gray-850'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={cancelMotivationForm}
                        className={`text-xs font-bold px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition cursor-pointer ${
                          isDark ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className={`text-xs font-bold px-4 py-1.5 text-white rounded-lg transition hover:opacity-95 cursor-pointer ${theme.bg}`}
                      >
                        保存する
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Motivations list */}
            <div className="space-y-3">
              {(!selfAnalysis.baseMotivations || selfAnalysis.baseMotivations.length === 0) ? (
                <div className={`p-8 rounded-2xl border border-dashed text-center text-xs space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  <p>登録された志望動機はありません。</p>
                  <p className="text-[10px] text-gray-400">「新規動機テンプレートを作成」から、就活の柱となる理由を準備しましょう！</p>
                </div>
              ) : (
                selfAnalysis.baseMotivations.map(bm => (
                  <div
                    key={bm.id}
                    className={`p-4.5 rounded-2xl border shadow-3xs flex flex-col gap-2.5 transition-all text-left group ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-block text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-150 text-gray-700'
                        }`}>
                          {bm.industry}
                        </span>
                        {bm.occupation && (
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md ${
                            isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-white border border-gray-200 text-gray-500'
                          }`}>
                            {bm.occupation}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEditMotivation(bm.id, bm.industry, bm.occupation || '', bm.content)}
                          className={`p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-100' : 'text-gray-400 hover:text-gray-700'
                          }`}
                          title="編集"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBaseMotivation(bm.id)}
                          className={`p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-rose-950/35 text-slate-400 hover:text-rose-400' : 'text-gray-400 hover:text-rose-600'
                          }`}
                          title="削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                      isDark ? 'text-slate-200' : 'text-gray-800'
                    }`}>
                      {bm.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: 想定質問と回答 FAQ */}
        {subTab === 'faq' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Header / Triggers */}
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-xs font-bold block ${isDark ? 'text-slate-350' : 'text-gray-500'}`}>
                  登録面接FAQ: {selfAnalysis.faqs?.length || 0}件
                </span>
              </div>
              
              {!isAddingFAQ && (
                <button
                  type="button"
                  onClick={() => setIsAddingFAQ(true)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:opacity-90 flex items-center gap-1 ${theme.bg} text-white shadow-xs`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  新規FAQ・質問ペアを追加
                </button>
              )}
            </div>

            {/* Presets shortcut drawer/banner */}
            {!isAddingFAQ && (
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-gray-50 border-gray-150/50'
              }`}>
                <span className={`block text-[10px] font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-650'}`}>
                  ⭐ 定番面接質問・逆引きショートカット
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {questionPresets.map((preset, idx) => {
                    const isAlreadyAdded = selfAnalysis.faqs?.some(f => f.question === preset);
                    if (isAlreadyAdded) return null;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFaqQuestion(preset);
                          setFaqAnswer('');
                          setIsAddingFAQ(true);
                        }}
                        className={`text-[9.5px] px-2.5 py-1 rounded-lg border text-left cursor-pointer transition-all ${
                          isDark 
                            ? 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700' 
                            : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:border-gray-300'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Editing / Creating MCQ panel */}
            <AnimatePresence>
              {isAddingFAQ && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-5 rounded-3xl border shadow-xs space-y-4 transition-all overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-250'
                  }`}
                >
                  <h4 className={`text-xs font-bold flex items-center gap-1 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    <Plus className="h-4 w-4" />
                    {faqIdToEdit ? '面接FAQの修正' : '面接FAQ質問と回答の追加'}
                  </h4>

                  <form onSubmit={handleSaveFAQ} className="space-y-3">
                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-650'}`}>
                        質問（Question）
                      </label>
                      <input
                        type="text"
                        required
                        value={faqQuestion}
                        onChange={e => setFaqQuestion(e.target.value)}
                        placeholder="例: 最大の挫折経験とそれをどう乗り越えたか？"
                        className={`w-full text-xs p-2.5 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-55/70 border-gray-200 text-gray-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-650'}`}>
                        自分の回答（Answer）
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={faqAnswer}
                        onChange={e => setFaqAnswer(e.target.value)}
                        placeholder="1分程度（300文字前後）で簡潔に話せるよう要点をまとめた回答文を入力します。"
                        className={`w-full text-xs p-3 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 leading-relaxed ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-150' : 'bg-gray-55/70 border-gray-200 text-gray-850'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={cancelFAQForm}
                        className={`text-xs font-bold px-3 py-1.5 border rounded-lg hover:bg-gray-50 transition cursor-pointer ${
                          isDark ? 'text-slate-400 border-slate-700 hover:bg-slate-800' : 'text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        className={`text-xs font-bold px-4 py-1.5 text-white rounded-lg transition hover:opacity-95 cursor-pointer ${theme.bg}`}
                      >
                        保存する
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQs List Accordions */}
            <div className="space-y-3">
              {(!selfAnalysis.faqs || selfAnalysis.faqs.length === 0) ? (
                <div className={`p-8 rounded-2xl border border-dashed text-center text-xs space-y-2 ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-400'
                }`}>
                  <p>面接想定質問は登録されていません。</p>
                  <p className="text-[10px] text-gray-405">上の定番ショートカットやお好みのQ&Aを登録しておくと、ES作成時にワンタップでコピペ可能です！</p>
                </div>
              ) : (
                selfAnalysis.faqs.map(faq => (
                  <div
                    key={faq.id}
                    className={`p-4 rounded-2xl border shadow-3xs space-y-2.5 transition-all text-left group ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-2 items-start">
                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md text-white ${theme.bg} mt-0.5 font-mono`}>Q</span>
                        <h4 className={`text-xs font-bold leading-relaxed ${isDark ? 'text-slate-155' : 'text-gray-905'}`}>
                          {faq.question}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditFAQ(faq.id, faq.question, faq.answer)}
                          className={`p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-100' : 'text-gray-400 hover:text-gray-700'
                          }`}
                          title="編集"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFAQ(faq.id)}
                          className={`p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ${
                            isDark ? 'hover:bg-rose-950/35 text-slate-400 hover:text-rose-400' : 'text-gray-400 hover:text-rose-600'
                          }`}
                          title="削除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start border-t/60 pt-2 border-dashed border-gray-100 dark:border-slate-800">
                      <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-md font-mono ${
                        isDark ? 'bg-slate-800 text-slate-350' : 'bg-gray-100 text-gray-500'
                      }`}>A</span>
                      <p className={`text-xs leading-relaxed whitespace-pre-wrap font-sans ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
