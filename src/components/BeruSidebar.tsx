/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  BookOpen,
  FileEdit,
  BrainCircuit,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { getTheme } from '../utils/theme';
import { useApp } from '../context/AppContext';

interface BeruSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

// ─── Component ───────────────────────────────────────────────────────────────

export default function BeruSidebar({ isOpen, onClose }: BeruSidebarProps) {
  const { settings, isDark, fontSize, companies } = useApp();
  const theme = getTheme(settings.themeColor);

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // ── Section collapse state ─────────────────────────────────────────────
  const [todoOpen, setTodoOpen]       = useState(true);
  const [memoOpen, setMemoOpen]       = useState(true);
  const [esOpen,   setEsOpen]         = useState(true);
  const [alertOpen, setAlertOpen]     = useState(true);

  // ── ① 就活アラート (deadline-based, read from AppContext companies) ─────
  const todayStr = new Date().toISOString().split('T')[0];
  const today    = new Date(todayStr);
  const activeAlerts: { id: string; name: string; type: string; due: string; color: string }[] = [];

  companies.forEach((co) => {
    if (co.esDeadline) {
      const target = new Date(co.esDeadline);
      if (!isNaN(target.getTime())) {
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffDays   = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays <= 3) {
          const dayLabel = diffDays === 0 ? '今日' : diffDays === 1 ? '明日' : `${diffDays}日後`;
          const timeStr  = co.esDeadline.includes(' ') ? co.esDeadline.split(' ')[1] : '23:59';
          activeAlerts.push({
            id:    `es-${co.id}`,
            name:  co.name,
            type:  co.selectionType === 'intern' ? 'インターンES' : '本選考ES',
            due:   `ES締切: ${dayLabel} ${timeStr}`,
            color: co.selectionType === 'intern'
              ? 'text-amber-600 bg-amber-50/60 dark:bg-amber-950/20 dark:text-amber-400'
              : 'text-red-500 bg-red-50/60 dark:bg-red-950/20 dark:text-red-400',
          });
        }
      }
    }
    if (co.interviewDate) {
      const target = new Date(co.interviewDate);
      if (!isNaN(target.getTime())) {
        const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        const diffDays   = Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays <= 3) {
          const dayLabel = diffDays === 0 ? '今日' : diffDays === 1 ? '明日' : `${diffDays}日後`;
          const parts    = co.interviewDate.split(/[ T]/);
          const timePart = parts[1] ? parts[1].substring(0, 5) : '';
          activeAlerts.push({
            id:    `interview-${co.id}`,
            name:  co.name,
            type:  co.selectionType === 'intern' ? 'インターン面接' : '本選考面接',
            due:   `面接: ${dayLabel} ${timePart}`.trim(),
            color: 'text-blue-500 bg-blue-50/60 dark:bg-blue-950/20 dark:text-blue-400',
          });
        }
      }
    }
  });

  // ── ② TODOリスト ───────────────────────────────────────────────────────
  const [todos, setTodos]         = useState<TodoItem[]>([
    { id: uid(), text: 'A社のESを提出する', done: false },
    { id: uid(), text: 'B社の面接対策をする', done: false },
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const todoInputRef = useRef<HTMLInputElement>(null);

  const addTodo = () => {
    const text = newTodoText.trim();
    if (!text) return;
    setTodos(prev => [...prev, { id: uid(), text, done: false }]);
    setNewTodoText('');
    todoInputRef.current?.focus();
  };

  const toggleTodo  = (id: string) =>
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const deleteTodo  = (id: string) =>
    setTodos(prev => prev.filter(t => t.id !== id));

  const doneCount   = todos.filter(t => t.done).length;

  // ── ③ 企業研究メモ帳 ────────────────────────────────────────────────
  const [companyMemo, setCompanyMemo] = useState(
    '【企業名】\n\n【事業内容・ビジネスモデル】\n\n【求める人物像】\n\n【自分との接点・志望理由】\n\n【気になったこと・質問メモ】\n'
  );
  const [memoCopied, setMemoCopied] = useState(false);

  const copyMemo = () => {
    navigator.clipboard.writeText(companyMemo).then(() => {
      setMemoCopied(true);
      setTimeout(() => setMemoCopied(false), 2000);
    });
  };

  // ── ④ 文字数カウンター付きESエディタ ──────────────────────────────
  const ES_TARGET = 400; // 目標文字数

  const [esCompanyLabel, setEsCompanyLabel] = useState('');
  const [esContent, setEsContent]           = useState('');
  const [esCopied, setEsCopied]             = useState(false);

  const esLen      = esContent.length;
  const esProgress = Math.min(esLen / ES_TARGET, 1);
  const esColor =
    esLen === 0          ? 'text-gray-400'
    : esLen < ES_TARGET  ? 'text-amber-500'
    :                      'text-emerald-500';

  const copyEs = () => {
    navigator.clipboard.writeText(esContent).then(() => {
      setEsCopied(true);
      setTimeout(() => setEsCopied(false), 2000);
    });
  };

  const clearEs = () => {
    if (esContent && !window.confirm('入力した内容をリセットしますか？')) return;
    setEsContent('');
    setEsCompanyLabel('');
  };

  // ── Section header helper ──────────────────────────────────────────────
  const SectionHeader = ({
    icon,
    label,
    open,
    onToggle,
    badge,
  }: {
    icon: React.ReactNode;
    label: string;
    open: boolean;
    onToggle: () => void;
    badge?: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center gap-1.5 text-left group ${
        isDark ? 'text-slate-300' : 'text-gray-800'
      }`}
    >
      {icon}
      <span className="text-xs font-extrabold flex-1">{label}</span>
      {badge}
      {open ? (
        <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0 group-hover:text-gray-600" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0 group-hover:text-gray-600" />
      )}
    </button>
  );

  // ────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/50 backdrop-blur-xs z-40"
      />

      {/* Slide-in drawer */}
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
        {/* ── ヘッダー ─────────────────────────────────────────────────── */}
        <div
          className={`p-4 flex items-center gap-3 border-b shrink-0 ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-1">
            {/* BERU キャラクター */}
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-md shrink-0 border border-white/20">
              <div className="relative flex flex-col items-center">
                <Bell className="h-6 w-6 text-amber-950 fill-amber-500/40 stroke-[2] animate-bounce" />
                <div className="absolute top-[9px] flex gap-1 w-full justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-950 flex items-center justify-center relative">
                    <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-950 flex items-center justify-center relative">
                    <span className="absolute top-0.5 left-0.5 w-0.5 h-0.5 rounded-full bg-white" />
                  </span>
                </div>
                <div className="absolute top-[16px] w-2.5 h-1.5 border-b-2 border-amber-950 rounded-b-full" />
              </div>
              <div className="absolute top-[13px] left-1.5 w-1.5 h-0.5 rounded-full bg-rose-400/85" />
              <div className="absolute top-[13px] right-1.5 w-1.5 h-0.5 rounded-full bg-rose-400/85" />
            </div>

            {/* 吹き出し */}
            <div
              className={`p-2.5 rounded-2xl border text-[11px] font-bold leading-normal relative text-left flex-1 ${
                isDark
                  ? 'bg-slate-850 border-slate-800 text-slate-205'
                  : 'bg-purple-50/60 border-purple-100/60 text-purple-950'
              }`}
            >
              <div
                className={`absolute top-4.5 -left-1 w-2 h-2 rotate-45 border-l border-b ${
                  isDark ? 'bg-slate-850 border-slate-800' : 'bg-purple-50/60 border-purple-100/60'
                }`}
              />
              就活ノートへようこそ！TODOや企業メモを自由に書き込んでね🔔
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
              isDark
                ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                : 'border-gray-150 hover:bg-gray-100 text-gray-555'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── スクロールエリア ──────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin ${fontSizeClass}`}>

          {/* ① 就活状況アラート ─────────────────────────────────────── */}
          <div className="space-y-2">
            <SectionHeader
              icon={<AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />}
              label="就活状況アラート"
              open={alertOpen}
              onToggle={() => setAlertOpen(o => !o)}
              badge={
                activeAlerts.length > 0 ? (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    {activeAlerts.length}
                  </span>
                ) : undefined
              }
            />
            <AnimatePresence initial={false}>
              {alertOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
                    <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                      {activeAlerts.length > 0
                        ? `🚨 締め切り間近の選考が ${activeAlerts.length} 件あります`
                        : '✅ 直近の締め切りアラートはありません'}
                    </span>
                    {activeAlerts.length > 0 && (
                      <div className="grid grid-cols-1 gap-1.5">
                        {activeAlerts.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-[10px] font-bold ${
                              isDark
                                ? 'bg-slate-900/60 border-slate-800/80'
                                : 'bg-white border-gray-150/70'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black ${item.color}`}>
                                {item.type}
                              </span>
                              <span className="text-gray-400 dark:text-slate-400 font-mono text-[9px]">
                                {item.due}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ② TODOリスト ───────────────────────────────────────────── */}
          <div className="space-y-2">
            <SectionHeader
              icon={<CheckSquare className={`h-4 w-4 ${theme.text} shrink-0`} />}
              label="就活TODOリスト"
              open={todoOpen}
              onToggle={() => setTodoOpen(o => !o)}
              badge={
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${theme.lightBg} ${theme.text}`}>
                  {doneCount}/{todos.length}
                </span>
              }
            />
            <AnimatePresence initial={false}>
              {todoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`rounded-2xl border p-3 space-y-2 ${
                    isDark ? 'bg-slate-850/40 border-slate-800' : 'bg-gray-50/60 border-gray-150'
                  }`}>
                    {/* 進捗バー */}
                    {todos.length > 0 && (
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <motion.div
                          className={`h-full rounded-full ${theme.bg}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(doneCount / todos.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}

                    {/* TODOアイテム一覧 */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                      {todos.length === 0 && (
                        <p className="text-center text-[10px] font-bold text-gray-400 dark:text-slate-500 py-3">
                          TODOを追加してみよう！
                        </p>
                      )}
                      {todos.map((todo) => (
                        <div key={todo.id} className="flex items-center gap-2 group">
                          <button
                            type="button"
                            onClick={() => toggleTodo(todo.id)}
                            className="shrink-0 transition-transform hover:scale-110 active:scale-95"
                          >
                            {todo.done ? (
                              <CheckSquare className={`h-4 w-4 ${theme.text}`} />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                            )}
                          </button>
                          <span
                            className={`flex-1 text-[11px] font-bold leading-relaxed ${
                              todo.done
                                ? 'line-through text-gray-400 dark:text-slate-500'
                                : isDark ? 'text-slate-200' : 'text-gray-800'
                            }`}
                          >
                            {todo.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteTodo(todo.id)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 新規追加フォーム */}
                    <div className="flex gap-2 pt-1">
                      <input
                        ref={todoInputRef}
                        type="text"
                        value={newTodoText}
                        onChange={e => setNewTodoText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
                        placeholder="例：A社のESを提出する..."
                        className={`flex-1 px-3 py-1.5 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-${settings.themeColor}-450 font-bold transition-all ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={addTodo}
                        disabled={!newTodoText.trim()}
                        className={`p-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 ${theme.bg} text-white ${
                          !newTodoText.trim() ? 'opacity-40 cursor-not-allowed' : theme.hover
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ③ 企業研究メモ帳 ────────────────────────────────────────── */}
          <div className="space-y-2">
            <SectionHeader
              icon={<BookOpen className={`h-4 w-4 ${theme.text} shrink-0`} />}
              label="企業研究メモ帳"
              open={memoOpen}
              onToggle={() => setMemoOpen(o => !o)}
            />
            <AnimatePresence initial={false}>
              {memoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`rounded-2xl border p-3 space-y-2 ${
                    isDark ? 'bg-slate-850/40 border-slate-800' : 'bg-gray-50/60 border-gray-150'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-gray-400 dark:text-slate-500">
                        📝 自由に書き込んでOK！コピーして使ってね
                      </span>
                      <button
                        type="button"
                        onClick={copyMemo}
                        className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                          memoCopied
                            ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                            : 'text-gray-400 hover:text-gray-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {memoCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {memoCopied ? 'コピー済み' : 'コピー'}
                      </button>
                    </div>
                    <textarea
                      value={companyMemo}
                      onChange={e => setCompanyMemo(e.target.value)}
                      rows={9}
                      placeholder="気になる企業の情報を自由にメモしよう..."
                      className={`w-full px-3 py-2.5 text-[11px] border rounded-xl focus:outline-none focus:ring-1 focus:ring-${settings.themeColor}-450 font-medium transition-all resize-none leading-relaxed ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500">
                        {companyMemo.length} 文字
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!companyMemo.trim() || window.confirm('メモ内容をリセットしますか？')) {
                            setCompanyMemo(
                              '【企業名】\n\n【事業内容・ビジネスモデル】\n\n【求める人物像】\n\n【自分との接点・志望理由】\n\n【気になったこと・質問メモ】\n'
                            );
                          }
                        }}
                        className="text-[9px] font-black text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                      >
                        テンプレートに戻す
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ④ 文字数カウンター付きESエディタ ──────────────────────── */}
          <div className="space-y-2 pb-6">
            <SectionHeader
              icon={<FileEdit className={`h-4 w-4 ${theme.text} shrink-0`} />}
              label="ES・志望動機エディタ"
              open={esOpen}
              onToggle={() => setEsOpen(o => !o)}
              badge={
                esLen > 0 ? (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    esLen >= ES_TARGET
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                  }`}>
                    {esLen} 字
                  </span>
                ) : undefined
              }
            />
            <AnimatePresence initial={false}>
              {esOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={`rounded-2xl border p-3 space-y-2.5 ${
                    isDark ? 'bg-slate-850/40 border-slate-800' : 'bg-gray-50/60 border-gray-150'
                  }`}>
                    {/* 企業ラベル入力 */}
                    <div>
                      <label className="block text-[9px] font-black text-gray-400 dark:text-slate-500 mb-1">
                        対象企業・設問名（任意）
                      </label>
                      <input
                        type="text"
                        value={esCompanyLabel}
                        onChange={e => setEsCompanyLabel(e.target.value)}
                        placeholder="例：A社 志望動機（400字）"
                        className={`w-full px-3 py-1.5 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-${settings.themeColor}-450 font-bold transition-all ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
                            : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    {/* ESテキストエリア */}
                    <textarea
                      value={esContent}
                      onChange={e => setEsContent(e.target.value)}
                      rows={8}
                      placeholder="志望動機・自己PRをここに入力しよう。文字数はリアルタイムでカウントされます..."
                      className={`w-full px-3 py-2.5 text-[11px] border rounded-xl focus:outline-none focus:ring-1 focus:ring-${settings.themeColor}-450 font-medium transition-all resize-none leading-relaxed ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />

                    {/* 文字数カウンター + プログレスバー */}
                    <div className="space-y-1.5">
                      <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
                        <motion.div
                          className={`h-full rounded-full transition-colors duration-300 ${
                            esLen >= ES_TARGET ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                          animate={{ width: `${esProgress * 100}%` }}
                          transition={{ duration: 0.15 }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black tabular-nums ${esColor}`}>
                          {esLen} <span className="font-medium text-gray-400">/ 目安 {ES_TARGET} 字</span>
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500">
                          {esLen >= ES_TARGET
                            ? '✅ 目標文字数を達成！'
                            : `あと ${ES_TARGET - esLen} 字`}
                        </span>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={copyEs}
                        disabled={esLen === 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                          esLen === 0
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
                            : esCopied
                              ? 'bg-emerald-500 text-white'
                              : `${theme.bg} text-white ${theme.hover}`
                        }`}
                      >
                        {esCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {esCopied ? 'コピー済み！' : 'コピー'}
                      </button>
                      <button
                        type="button"
                        onClick={clearEs}
                        className={`px-3 py-2 text-[11px] font-black rounded-xl border transition-all cursor-pointer ${
                          isDark
                            ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-rose-400'
                            : 'border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500'
                        }`}
                      >
                        クリア
                      </button>
                    </div>

                    {/* BERU のひとこと */}
                    <div className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-start gap-2 ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-400'
                        : 'bg-purple-50/40 border-purple-100/50 text-purple-700'
                    }`}>
                      <BrainCircuit className="h-3.5 w-3.5 shrink-0 mt-0.5 text-purple-500" />
                      <span>
                        {esLen === 0
                          ? '書き始めたら文字数が自動でカウントされるよ！目安は設問の指定字数に合わせてね🔔'
                          : esLen < 100
                            ? 'まだ序盤！まずは思ったことをどんどん書き出してみよう💪'
                            : esLen < ES_TARGET
                              ? `いい感じ！あと ${ES_TARGET - esLen} 字で目安達成だよ✨`
                              : '目標達成！読み返して磨きをかけてみよう🎉'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        {/* ── フッター（クレジット） ───────────────────────────────── */}
        <div className={`px-4 py-3 border-t shrink-0 text-center ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-gray-100 bg-white'
        }`}>
          <span className="text-[9px] font-bold text-gray-400 dark:text-slate-600">
            🔔 BERU 就活ノート — データはブラウザのみで管理されます
          </span>
        </div>
      </motion.div>
    </>
  );
}
