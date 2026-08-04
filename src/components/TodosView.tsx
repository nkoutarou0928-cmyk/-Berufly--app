/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { 
  Plus, 
  Trash2, 
  Check, 
  Square, 
  CheckSquare, 
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Target,
  CircleDot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TodoScope, TodoItem } from '../types';

export default function TodosView() {
  const { 
    todos, 
    settings, 
    isDark,
    saveTodos,
    addNotificationAlarm
  } = useApp();

  const theme = getTheme(settings.themeColor);

  // States
  const [activeScope, setActiveScope] = useState<TodoScope>('today');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<Record<string, string>>({});

  // Form Submission
  const handleAddNewTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: newTitle,
      completed: false,
      scope: activeScope,
      dueDate: activeScope !== 'goal' ? newDueDate : undefined,
      subtasks: activeScope === 'goal' ? [] : undefined
    };

    const updated = [...todos, newTodo];
    saveTodos(updated);

    // Schedule a notification if notification timing matches
    if (newTodo.dueDate && settings.notificationsEnabled) {
      addNotificationAlarm(
        'タスクリマインド',
        `期限間近のタスクがあります: ${newTodo.title} (期日: ${newTodo.dueDate})`,
        'todo',
        undefined,
        newTodo.id
      );
    }

    setNewTitle('');
  };

  // Subtask Add form
  const handleAddSub = (todoId: string) => {
    const title = newSubtaskInputs[todoId] || '';
    if (!title.trim()) return;

    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const subtasks = todo.subtasks || [];
        const newSub = { id: `st-${Date.now()}`, title, completed: false };
        return { ...todo, subtasks: [...subtasks, newSub], completed: false };
      }
      return todo;
    });

    saveTodos(updated);
    setNewSubtaskInputs(prev => ({ ...prev, [todoId]: '' }));
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        const nextCompleted = !todo.completed;
        let updatedSubtasks = todo.subtasks;
        if (todo.subtasks) {
          updatedSubtasks = todo.subtasks.map(st => ({ ...st, completed: nextCompleted }));
        }
        return { ...todo, completed: nextCompleted, subtasks: updatedSubtasks };
      }
      return todo;
    });
    saveTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    saveTodos(updated);
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId && todo.subtasks) {
        const nextSubtasks = todo.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = nextSubtasks.every(st => st.completed);
        return { ...todo, subtasks: nextSubtasks, completed: allCompleted };
      }
      return todo;
    });
    saveTodos(updated);
  };

  const handleDeleteSubtask = (todoId: string, subtaskId: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId && todo.subtasks) {
        const nextSubtasks = todo.subtasks.filter(st => st.id !== subtaskId);
        const allCompleted = nextSubtasks.length > 0 && nextSubtasks.every(st => st.completed);
        return { ...todo, subtasks: nextSubtasks, completed: allCompleted };
      }
      return todo;
    });
    saveTodos(updated);
  };

  // Filtered lists
  const filteredTodos = todos.filter(t => t.scope === activeScope);

  const getScopeLabel = (sc: TodoScope) => {
    switch (sc) {
      case 'today': return '今日のTodo';
      case 'weekly': return '今週のTodo';
      case 'monthly': return '今月のTodo';
      case 'goal': return '長期目標と進捗';
    }
  };

  const getScopeBadgeColor = (sc: TodoScope) => {
    switch (sc) {
      case 'today': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'weekly': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'monthly': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'goal': return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          タスク・目標管理
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">就活に必要なステップを整理し、計画的にクリアしましょう</p>
      </div>

      {/* Scope Toggles */}
      <div className={`flex p-1 rounded-xl overflow-x-auto gap-0.5 transition-all ${
        isDark ? 'bg-slate-900 border border-slate-800' : 'bg-gray-100'
      }`}>
        {(['today', 'weekly', 'monthly', 'goal'] as TodoScope[]).map(sc => (
          <button
            key={sc}
            type="button"
            onClick={() => setActiveScope(sc)}
            className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeScope === sc 
                ? `${isDark ? 'bg-slate-800 text-slate-100 border border-slate-700/60' : `${theme.lightBg} ${theme.textDark} border border-${settings.themeColor}-200/50`} shadow-xs` 
                : `${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-950'}`
            }`}
          >
            {getScopeLabel(sc)}
          </button>
        ))}
      </div>

      {/* Main Todo Input Form */}
      <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <form onSubmit={handleAddNewTodo} className="space-y-3">
          <div className={`text-xs font-bold flex items-center gap-1 ${
            isDark ? 'text-slate-300' : 'text-gray-800'
          }`}>
            <Plus className="h-4 w-4" />
            新たな「{getScopeLabel(activeScope)}」を登録
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder={activeScope === 'goal' ? '例: エントリーしたすべての企業の自己分析を完了させる' : '例: 〇〇社の合同説明会アーカイブを視聴する'}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 transition-all ${
                isDark ? 'bg-slate-800 border-slate-705 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-50/50'
              }`}
            />
            
            {activeScope !== 'goal' && (
              <input
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className={`px-3 py-2 rounded-xl text-xs focus:outline-hidden transition-all ${
                  isDark ? 'bg-slate-800 border-slate-705 text-slate-100 font-mono' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
              />
            )}

            <button
              type="submit"
              className={`px-4 py-2 ${theme.onBg} font-bold text-xs rounded-xl transition-all cursor-pointer ${theme.bg} ${theme.hover} shadow-xs flex items-center justify-center gap-1`}
            >
              <Plus className="h-3.5 w-3.5" />
              追加
            </button>
          </div>
        </form>
      </div>

      {/* Todo Items list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-8 rounded-2xl border border-dashed text-center text-xs space-y-2 transition-all ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-100 text-gray-404'
              }`}
            >
              <CheckSquare className="h-6 w-6 mx-auto opacity-40" />
              <p>登録されたタスクはありません</p>
              <p className="text-micro">上のフォームから新しく追加できます</p>
            </motion.div>
          ) : (
            filteredTodos.map(todo => {
              const isGoal = todo.scope === 'goal';
              const subTasksCount = todo.subtasks?.length || 0;
              const subTasksCompleted = todo.subtasks?.filter(s => s.completed).length || 0;
              const subTasksRate = subTasksCount > 0 ? Math.round((subTasksCompleted / subTasksCount) * 100) : 0;

              return (
                <motion.div
                  key={todo.id}
                  layoutId={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border shadow-xs flex flex-col gap-3 transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox */}
                      <button 
                        onClick={() => handleToggleTodo(todo.id)}
                        className={`mt-0.5 flex-shrink-0 cursor-pointer text-gray-400 hover:${theme.text} transition-colors`}
                      >
                        {todo.completed ? (
                          <CheckSquare className={`h-5 w-5 ${theme.text}`} />
                        ) : (
                          <Square className={`h-5 w-5 ${isDark ? 'text-slate-700' : 'text-gray-300'}`} />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className={`text-xs font-semibold leading-relaxed ${
                          todo.completed ? 'text-gray-450 line-through' : (isDark ? 'text-slate-200' : 'text-gray-905')
                        }`}>
                          {todo.title}
                        </p>
                        {todo.dueDate && (
                          <span className={`inline-flex items-center gap-1 text-micro mt-1 font-mono ${
                            isDark ? 'text-slate-400' : 'text-gray-400'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            締め切り: {todo.dueDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-1 px-1.5 text-gray-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Goal custom subtask block */}
                  {isGoal && (
                    <div className="pl-7 pt-2 border-t border-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-micro font-bold text-gray-700">
                          <Target className={`h-3.5 w-3.5 ${theme.text}`} />
                          サブタスク進捗状況
                        </div>
                        <span className={`text-micro font-bold font-mono ${theme.textDark}`}>{subTasksRate}% ({subTasksCompleted}/{subTasksCount})</span>
                      </div>

                      {/* Goal progress indicator */}
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${theme.bg}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${subTasksRate}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* Subtask list */}
                      <div className="space-y-1.5">
                        {todo.subtasks?.map(st => (
                          <div 
                            key={st.id}
                            className="flex items-center justify-between gap-2 p-1.5 bg-gray-50/50 rounded-lg group"
                          >
                            <label className="flex items-center gap-2 text-micro cursor-pointer min-w-0">
                              <input 
                                type="checkbox"
                                checked={st.completed}
                                onChange={() => handleToggleSubtask(todo.id, st.id)}
                                className={`rounded-sm text-${settings.themeColor}-655 focus:ring-0 cursor-pointer ${theme.accent}`}
                              />
                              <span className={`truncate ${st.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                                {st.title}
                              </span>
                            </label>
                            
                            <button
                              onClick={() => handleDeleteSubtask(todo.id, st.id)}
                              className="text-gray-300 hover:text-rose-500 transition-colors p-0.5 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add subtask input */}
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="新しいサブタスク..."
                          value={newSubtaskInputs[todo.id] || ''}
                          onChange={e => setNewSubtaskInputs(prev => ({ ...prev, [todo.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleAddNewTodo(e); // prevent default form trigger, do subtask
                              handleAddSub(todo.id);
                            }
                          }}
                          className={`flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-micro focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400`}
                        />
                        <button
                          onClick={() => handleAddSub(todo.id)}
                          className={`px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-micro rounded-lg transition-all cursor-pointer flex items-center justify-center`}
                        >
                          追加
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
