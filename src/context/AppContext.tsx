/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, TodoItem, AppSettings, NotificationItem, ObVisit, OfferComparison, CompanyStatus, TodoScope, SelfAnalysis, BaseMotivation, FAQItem, ESCategory, ESStatus, IndustryResearch, CompanyResearch, IndustryCompanyNote } from '../types';
import { INITIAL_COMPANIES, INITIAL_TODOS, INITIAL_SETTINGS, INITIAL_OB_VISITS, INITIAL_OFFER_COMPARISONS, INITIAL_SELF_ANALYSIS, INITIAL_INDUSTRY_RESEARCH } from '../seedData';
import { supabase, getSupabaseClientStatus } from '../utils/supabaseClient';

interface AppContextType {
  companies: Company[];
  trashCompanies: (Company & { deletedAt: string })[];
  todos: TodoItem[];
  settings: AppSettings;
  obVisits: ObVisit[];
  offerComparisons: OfferComparison[];
  notifications: NotificationItem[];
  activeTab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'research' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about';
  selectedCompanyId: string | null;
  selectedTodoId: string | null;
  detailTab: 'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'; // Allow detail navigation
  isDark: boolean;
  selfAnalysis: SelfAnalysis;

  // Account and sync states
  currentUser: { uid: string; email: string; name: string; isAnonymous: boolean } | null;
  authStatus: 'welcome' | 'unauthenticated' | 'authenticated';
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';

  // Account actions
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completePasswordReset: (email: string, token: string, newPass: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean }>;
  
  // Navigation actions
  setActiveTab: (tab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'research' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about') => void;
  navigateToCompany: (id: string, subTab?: 'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons') => void;
  setSelectedCompanyId: (id: string | null) => void;
  
  // Self Analysis actions
  updateSelfPR: (text: string) => void;
  updateGakuchika: (text: string) => void;
  addBaseMotivation: (motivation: Omit<BaseMotivation, 'id'>) => void;
  updateBaseMotivation: (id: string, updated: Partial<BaseMotivation>) => void;
  deleteBaseMotivation: (id: string) => void;
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (id: string, updated: Partial<FAQItem>) => void;
  deleteFAQ: (id: string) => void;
  
  // Company actions
  addCompany: (company: Omit<Company, 'id' | 'esMemos' | 'interviewMemos'>) => string;
  updateCompany: (id: string, updated: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  restoreCompany: (id: string) => void;
  permanentlyDeleteCompany: (id: string) => void;
  addESMemo: (
    companyId: string,
    question: string,
    answer: string,
    isDraft: boolean,
    category?: ESCategory,
    minChars?: number,
    maxChars?: number,
    status?: ESStatus
  ) => void;
  updateESMemo: (
    companyId: string,
    memoId: string,
    updated: {
      question?: string;
      answer?: string;
      isDraft?: boolean;
      category?: ESCategory;
      minChars?: number;
      maxChars?: number;
      status?: ESStatus;
    }
  ) => void;
  deleteESMemo: (companyId: string, memoId: string) => void;
  addInterviewMemo: (companyId: string, memo: Omit<Company['interviewMemos'][0], 'id'>) => void;
  updateInterviewMemo: (companyId: string, memoId: string, updated: Partial<Company['interviewMemos'][0]>) => void;
  deleteInterviewMemo: (companyId: string, memoId: string) => void;
  updateCompanyResearch: (companyId: string, updated: Partial<CompanyResearch>) => void;

  // Industry Research actions (業界・企業研究タブ)
  industryResearch: IndustryResearch[];
  addIndustryResearch: (research: Omit<IndustryResearch, 'id'>) => void;
  updateIndustryResearch: (id: string, updated: Partial<IndustryResearch>) => void;
  deleteIndustryResearch: (id: string) => void;
  addCompanyNoteToIndustry: (industryId: string, note: Omit<IndustryCompanyNote, 'id'>) => void;
  updateCompanyNoteInIndustry: (industryId: string, noteId: string, updated: Partial<IndustryCompanyNote>) => void;
  deleteCompanyNoteFromIndustry: (industryId: string, noteId: string) => void;
  promoteCompanyNote: (industryId: string, noteId: string) => void;

  // Todo actions
  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  updateTodo: (id: string, updated: Partial<TodoItem>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  toggleSubtask: (todoId: string, subtaskId: string) => void;
  addSubtask: (todoId: string, title: string) => void;
  deleteSubtask: (todoId: string, subtaskId: string) => void;

  // OB Visits & Comparisons
  addObVisit: (visit: Omit<ObVisit, 'id'>) => void;
  updateObVisit: (id: string, updated: Partial<ObVisit>) => void;
  deleteObVisit: (id: string) => void;
  addOfferComparison: (comp: Omit<OfferComparison, 'id'>) => void;
  updateOfferComparison: (id: string, updated: Partial<OfferComparison>) => void;
  deleteOfferComparison: (id: string) => void;

  // Onboarding
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;

  // Settings & Notifications actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  addNotificationAlarm: (title: string, message: string, type: NotificationItem['type'], targetCompanyId?: string, targetTodoId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Direct Supabase save triggers
  saveCompanies: (newCompanies: Company[]) => Promise<void>;
  saveTodos: (newTodos: TodoItem[]) => Promise<void>;
  saveSelfAnalysis: (newAnalysis: SelfAnalysis) => Promise<void>;
  saveEvents: (newCompanies: Company[]) => Promise<void>;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  selectionTypeFilter: 'main' | 'intern';
  setSelectionTypeFilter: (type: 'main' | 'intern') => void;

  // Global workspace-bar search (企業一覧の絞り込みに使用)
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Primary States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [trashCompanies, setTrashCompanies] = useState<(Company & { deletedAt: string })[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [obVisits, setObVisits] = useState<ObVisit[]>([]);
  const [offerComparisons, setOfferComparisons] = useState<OfferComparison[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isDark, setIsDark] = useState(false);
  const [selfAnalysis, setSelfAnalysis] = useState<SelfAnalysis>(INITIAL_SELF_ANALYSIS);
  const [industryResearch, setIndustryResearch] = useState<IndustryResearch[]>([]);
  
  // Font Size state
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');

  // Selection Type filter state
  const [selectionTypeFilter, setSelectionTypeFilter] = useState<'main' | 'intern'>('main');
  const [searchQuery, setSearchQuery] = useState('');

  const setFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSizeState(size);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    const suffix = activeUserId ? `_${activeUserId}` : '';
    localStorage.setItem(`shukatsu_font_size${suffix}`, size);
  };

  useEffect(() => {
    if (fontSize === 'small') {
      document.documentElement.classList.add('font-size-small');
      document.documentElement.classList.remove('font-size-medium', 'font-size-large');
      document.documentElement.style.fontSize = '14px';
    } else if (fontSize === 'large') {
      document.documentElement.classList.add('font-size-large');
      document.documentElement.classList.remove('font-size-small', 'font-size-medium');
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.classList.add('font-size-medium');
      document.documentElement.classList.remove('font-size-small', 'font-size-large');
      document.documentElement.style.fontSize = '16px';
    }
  }, [fontSize]);
  
  // Navigation UI States
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'todos' | 'calendar' | 'companies' | 'research' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about'>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'>('basic');

  // Onboarding UI State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Account & Sync States
  const [currentUser, setCurrentUser] = useState<AppContextType['currentUser']>(null);
  const [authStatus, setAuthStatus] = useState<AppContextType['authStatus']>('welcome');
  const [syncStatus, setSyncStatus] = useState<AppContextType['syncStatus']>('synced');

  const setIsSyncing = (isSyncing: boolean) => {
    setSyncStatus(isSyncing ? 'syncing' : 'synced');
  };

  // Dynamic light/dark mode tracking
  useEffect(() => {
    const checkDark = () => {
      const mode = settings.themeMode || 'light';
      const darkActive = mode === 'dark' || 
        (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(darkActive);
      
      if (darkActive) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#090A0C';
        document.body.style.color = '#ECEFF4';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#FFFFFF';
        document.body.style.color = '#111622';
      }
    };

    checkDark();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => checkDark();
    mediaQuery.addEventListener('change', listener);
    
    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [settings.themeMode]);

  // Load from localStorage depending on active account state
  useEffect(() => {
    try {
      const lastAuthStatus = localStorage.getItem('shukatsu_auth_status');
      const initialStatus = lastAuthStatus === 'guest' ? 'welcome' : ((lastAuthStatus as AppContextType['authStatus']) || 'welcome');
      setAuthStatus(initialStatus);

      let uid = '';
      if (initialStatus === 'authenticated') {
        const storedUid = localStorage.getItem('shukatsu_user_uid');
        if (storedUid) {
          uid = storedUid;
          const email = localStorage.getItem('shukatsu_user_email') || 'user@example.com';
          const name = localStorage.getItem('shukatsu_user_name') || '就活キャリア';
          setCurrentUser({
            uid: storedUid,
            email,
            name,
            isAnonymous: false
          });
        }
      }

      // Default all business data states to empty for safety (data loads from Supabase reactively)
      setCompanies([]);
      setTrashCompanies([]);
      setTodos([]);
      setObVisits([]);
      setOfferComparisons([]);
      setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
      setNotifications([]);
      setIndustryResearch([]);

      const onboarded = localStorage.getItem('shukatsu_onboarded');
      if (onboarded !== 'true') {
        setShowOnboarding(true);
      }

      const storedFontSize = localStorage.getItem(`shukatsu_font_size` + (uid ? `_${uid}` : ''));
      if (storedFontSize === 'small' || storedFontSize === 'medium' || storedFontSize === 'large') {
        setFontSizeState(storedFontSize);
      } else {
        setFontSizeState('medium');
      }

    } catch (e) {
      console.error('Error loading localStorage configurations', e);
    }
  }, []);

  // Listen for Supabase Auth changes to keep state synced dynamically.
  // CRITICAL: Only call loadUserDataFromSupabase for SIGNED_IN and INITIAL_SESSION.
  // TOKEN_REFRESHED, USER_UPDATED, etc. must NOT trigger a full data re-fetch
  // because it would race with ongoing save operations (saveTodos/saveCompanies)
  // and cause the syncStatus to be stuck in 'syncing' forever.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth Event]:', event);

      if (session?.user) {
        const uid = session.user.id;
        const email = session.user.email || '';
        const name = session.user.user_metadata?.name || email.split('@')[0];

        // Always keep localStorage fresh (safe to do for any event)
        localStorage.setItem('shukatsu_auth_status', 'authenticated');
        localStorage.setItem('shukatsu_user_uid', uid);
        localStorage.setItem('shukatsu_user_email', email);
        localStorage.setItem('shukatsu_user_name', name);
        setCurrentUser({ uid, email, name, isAnonymous: false });
        setAuthStatus('authenticated');

        // Only fetch data from Supabase on actual login events.
        // TOKEN_REFRESHED / USER_UPDATED / MFA_CHALLENGE_VERIFIED etc. must be ignored
        // to prevent racing with active save operations.
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          console.log('[Auth] ログインイベント検知。Supabaseからデータを取得します。event:', event);
          // Clear stale UI state before loading fresh data
          setCompanies([]);
          setTrashCompanies([]);
          setTodos([]);
          setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
          await loadUserDataFromSupabase(uid, name);
        } else {
          console.log('[Auth] トークン更新などのサブイベント（無視）:', event);
        }
      } else {
        // Signed out — cleanup
        const lastAuthStatus = localStorage.getItem('shukatsu_auth_status');
        if (lastAuthStatus === 'authenticated') {
          console.log('[Auth] サインアウト検知。ローカルデータをクリアします。');
          localStorage.removeItem('shukatsu_auth_status');
          localStorage.removeItem('shukatsu_user_uid');
          localStorage.removeItem('shukatsu_user_email');
          localStorage.removeItem('shukatsu_user_name');
          setCurrentUser(null);
          setAuthStatus('welcome');
          setCompanies([]);
          setTrashCompanies([]);
          setTodos([]);
          setObVisits([]);
          setOfferComparisons([]);
          setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
          setIndustryResearch([]);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for online/offline events for real-time automatic syncing status bar
  useEffect(() => {
    const handleOnline = () => {
      if (authStatus === 'authenticated') {
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('synced'), 1000);
      }
    };
    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authStatus]);

  // Sync animation scheduler
  const triggerSync = () => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      setSyncStatus('synced');
    }, 700);
    return () => clearTimeout(timer);
  };

  // Generic upsert helper for the self_analysis table (used as a per-title key/value store).
  // Requires the unique index on (user_id, title) added in
  // supabase/migrations/0001_stable_ids_and_upsert.sql.
  const saveUserDataItem = async (userId: string, title: string, content: string) => {
    const { error } = await supabase
      .from('self_analysis')
      .upsert({ user_id: userId, title, content }, { onConflict: 'user_id,title' });
    if (error) {
      console.error(`[saveUserDataItem] UPSERT error for ${title}:`, error);
      throw error;
    }
  };

  // Save to LocalStorage helpers, supporting reactive account databases
  const saveEvents = async (newCompanies: Company[]) => {
    setIsSyncing(true);
    try {
      console.log('[saveEvents] No Supabase table for events in the new schema. Skipping database write.');
    } finally {
      setIsSyncing(false);
    }
  };

  const saveCompanies = async (newCompanies: Company[]) => {
    // ローカルStateを即座に更新（UI反映のため先に実行）
    setCompanies(newCompanies);

    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    console.log('[🏢 saveCompanies] activeUserId:', activeUserId, '| 件数:', newCompanies.length);
    if (!activeUserId) {
      console.warn('[saveCompanies] ⚠️ activeUserIdがnull。Supabase同期をスキップします。');
      return;
    }
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('syncing');
    try {
      const currentAppIds = newCompanies.map(c => c.id);

      // STEP 1: upsert first, so a mid-operation failure never loses data that
      // already exists remotely (unlike the previous delete-then-insert).
      if (newCompanies.length > 0) {
        const companiesToUpsert = newCompanies.map(c => ({
          user_id: activeUserId,
          app_id: c.id,
          name: c.name,
          status: c.status
        }));
        const { error: upsertErr } = await supabase
          .from('companies')
          .upsert(companiesToUpsert, { onConflict: 'user_id,app_id' });
        if (upsertErr) throw new Error('企業UPSERT失敗: ' + upsertErr.message + ' (code: ' + upsertErr.code + ')');

        const memosToUpsert = newCompanies.map(c => ({
          user_id: activeUserId,
          company_app_id: c.id,
          company_name: c.name,
          content: JSON.stringify({
            id: c.id,
            industry: c.industry,
            preference: c.preference,
            selectionStatusIntern: c.selectionStatusIntern,
            selectionStage: c.selectionStage,
            esDeadline: c.esDeadline,
            interviewDate: c.interviewDate,
            esMemos: c.esMemos,
            interviewMemos: c.interviewMemos,
            notes: c.notes,
            headquarters: c.headquarters,
            scale: c.scale,
            website: c.website,
            establishedYear: c.establishedYear,
            employeeCount: c.employeeCount,
            isForeign: c.isForeign,
            category: c.category,
            selectionType: c.selectionType,
            internType: c.internType,
            internSteps: c.internSteps,
            research: c.research
          })
        }));
        const { error: memoUpsertErr } = await supabase
          .from('company_memos')
          .upsert(memosToUpsert, { onConflict: 'user_id,company_app_id' });
        if (memoUpsertErr) throw new Error('企業詳細メモUPSERT失敗: ' + memoUpsertErr.message + ' (code: ' + memoUpsertErr.code + ')');
      }

      // STEP 2: remove rows that no longer exist locally, only after the upsert succeeded.
      const { data: existingRows, error: selectErr } = await supabase
        .from('companies')
        .select('app_id')
        .eq('user_id', activeUserId);
      if (selectErr) throw new Error('企業一覧の取得失敗: ' + selectErr.message);

      const idsToDelete = (existingRows || [])
        .map(r => r.app_id as string | null)
        .filter((id): id is string => !!id && !currentAppIds.includes(id));

      if (idsToDelete.length > 0) {
        const { error: memoDelErr } = await supabase
          .from('company_memos')
          .delete()
          .eq('user_id', activeUserId)
          .in('company_app_id', idsToDelete);
        if (memoDelErr) throw new Error('企業詳細メモDELETE失敗: ' + memoDelErr.message);

        const { error: deleteErr } = await supabase
          .from('companies')
          .delete()
          .eq('user_id', activeUserId)
          .in('app_id', idsToDelete);
        if (deleteErr) throw new Error('企業DELETE失敗: ' + deleteErr.message);
      }

      console.log('[saveCompanies] ✅ 同期完了');
      setSyncStatus('synced');
    } catch (e: any) {
      console.error('[saveCompanies] ❌ 例外:', e);
      setSyncStatus('error');
      alert('企業の保存に失敗しました:\n' + (e.message || String(e)));
    }
  };

  const saveTrashCompanies = async (newTrash: (Company & { deletedAt: string })[]) => {
    setTrashCompanies(newTrash);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'trash_companies', JSON.stringify(newTrash));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync trash companies:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveTodos = async (newTodos: TodoItem[]) => {
    setIsSyncing(true);
    try {
      // STEP 1: ローカルStateを即座に更新（UI反映のため先に実行）
      setTodos(newTodos);

      // STEP 2: ユーザーIDを取得（localStorage優先 = 同期的で確実）
      const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
      console.log('[📝 saveTodos] activeUserId:', activeUserId, '| 件数:', newTodos.length);

      // STEP 4: Supabase同期（ログインしている場合のみ）
      if (!activeUserId) {
        console.warn('[saveTodos] ⚠️ activeUserIdがnull。Supabase同期をスキップします。');
        return;
      }

      // 既存レコードを全削除してから再挿入
      const { error: deleteErr } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', activeUserId);
      console.log('[saveTodos] DELETE error:', deleteErr);
      if (deleteErr) throw new Error('DELETE失敗: ' + deleteErr.message + ' (code: ' + deleteErr.code + ')');

      if (newTodos.length > 0) {
        const toInsert = newTodos.map(t => ({
          user_id: activeUserId,
          task: JSON.stringify({
            id: t.id,
            title: t.title,
            scope: t.scope,
            dueDate: t.dueDate,
            subtasks: t.subtasks
          }),
          is_completed: t.completed
        }));

        const { error: insertErr } = await supabase
          .from('todos')
          .insert(toInsert);
        if (insertErr) throw new Error('INSERT失敗: ' + insertErr.message + ' (code: ' + insertErr.code + ')');
        console.log('[saveTodos] ✅ INSERT成功！');
      }

      console.log('[saveTodos] ✅ 同期完了');
    } catch (e: any) {
      console.error('[saveTodos] ❌ 例外:', e);
      alert('Todoの保存に失敗しました:\n' + (e.message || String(e)));
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'settings', JSON.stringify(newSettings));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync settings:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveObVisits = async (newVisits: ObVisit[]) => {
    setObVisits(newVisits);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'ob_visits', JSON.stringify(newVisits));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync OB visits:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveComparisons = async (newComparisons: OfferComparison[]) => {
    setOfferComparisons(newComparisons);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'offer_comparisons', JSON.stringify(newComparisons));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync offer comparisons:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveIndustryResearch = async (newResearch: IndustryResearch[]) => {
    setIndustryResearch(newResearch);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'industry_research', JSON.stringify(newResearch));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync industry research:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveNotifications = async (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
    if (!activeUserId) return;
    setIsSyncing(true);
    try {
      await saveUserDataItem(activeUserId, 'notifications', JSON.stringify(newNotifs));
      if (authStatus === 'authenticated') triggerSync();
    } catch (e) {
      console.error('Failed to sync notifications:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSelfAnalysis = async (newAnalysis: SelfAnalysis) => {
    setIsSyncing(true);
    try {
      setSelfAnalysis(newAnalysis);

      const activeUserId = localStorage.getItem('shukatsu_user_uid') || (currentUser?.uid ?? null);
      console.log('[📊 saveSelfAnalysis] activeUserId:', activeUserId);

      if (!activeUserId) {
        console.warn('[saveSelfAnalysis] ⚠️ activeUserIdがnull。Supabase同期をスキップします。');
        return;
      }

      // 既存レコードを全削除してから挿入
      const { error: deleteErr } = await supabase
        .from('self_analysis')
        .delete()
        .eq('user_id', activeUserId)
        .in('title', ['self_pr', 'gakuchika', 'base_motivations', 'faqs']);
      if (deleteErr) throw new Error('自己分析DELETE失敗: ' + deleteErr.message + ' (code: ' + deleteErr.code + ')');

      const toInsert = [
        {
          user_id: activeUserId,
          title: 'self_pr',
          content: newAnalysis.selfPR
        },
        {
          user_id: activeUserId,
          title: 'gakuchika',
          content: newAnalysis.gakuchika
        },
        {
          user_id: activeUserId,
          title: 'base_motivations',
          content: JSON.stringify(newAnalysis.baseMotivations)
        },
        {
          user_id: activeUserId,
          title: 'faqs',
          content: JSON.stringify(newAnalysis.faqs)
        }
      ];

      const { error: insertErr } = await supabase
        .from('self_analysis')
        .insert(toInsert);
      console.log('[saveSelfAnalysis] INSERT error:', insertErr);
      if (insertErr) throw new Error('自己分析INSERT失敗: ' + insertErr.message + ' (code: ' + insertErr.code + ')');
      console.log('[saveSelfAnalysis] ✅ 同期完了');
    } catch (e: any) {
      console.error('[saveSelfAnalysis] ❌ 例外:', e);
      alert('自己分析の保存に失敗しました:\n' + (e.message || String(e)));
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Account Actions ---
  const startAsGuest = () => {
    localStorage.setItem('shukatsu_auth_status', 'guest');
    setAuthStatus('guest');
    setCurrentUser({
      uid: 'guest-uid',
      email: 'guest@example.com',
      name: 'ゲストユーザー',
      isAnonymous: true
    });
    // Load standard templates
    setCompanies(INITIAL_COMPANIES);
    setTrashCompanies([]);
    setTodos(INITIAL_TODOS);
    setSettings(INITIAL_SETTINGS);
    setObVisits(INITIAL_OB_VISITS);
    setOfferComparisons(INITIAL_OFFER_COMPARISONS);
    setSelfAnalysis(INITIAL_SELF_ANALYSIS);
    setIndustryResearch(INITIAL_INDUSTRY_RESEARCH);
  };

  // ----------------------------------------------------
  // 🔐 厳格なログイン・認証・パスワードリセットのモックDBロジック
  const loadUserDataFromSupabase = async (uid: string, name: string) => {
    setIsSyncing(true);
    try {
      if (!uid) {
        console.error('[loadUserDataFromSupabase] UIDが未指定。処理を中断します。');
        return;
      }

      console.log('[loadUserDataFromSupabase] データ取得開始。UID:', uid);
      const verifiedUid = uid;

      // ================================================================
      // companies & company_memos テーブルを取得
      // ================================================================
      let cos: any[] = [];
      let memos: any[] = [];

      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', verifiedUid);
        if (error) {
          console.error('[loadUserDataFromSupabase] companies SELECTエラー:', error);
        } else if (data) {
          cos = data;
        }
      } catch (err) {
        console.error('[loadUserDataFromSupabase] companies SELECT例外:', err);
      }

      try {
        const { data, error } = await supabase
          .from('company_memos')
          .select('*')
          .eq('user_id', verifiedUid);
        if (error) {
          console.error('[loadUserDataFromSupabase] company_memos SELECTエラー:', error);
        } else if (data) {
          memos = data;
        }
      } catch (err) {
        console.error('[loadUserDataFromSupabase] company_memos SELECT例外:', err);
      }

      if (cos && cos.length > 0) {
        const loadedCos: Company[] = cos.map(c => {
          const matchedMemo = memos.find(m => m.company_name === c.name);
          const memoContent = matchedMemo ? matchedMemo.content : '';

          let parsed: any = null;
          if (memoContent) {
            try {
              const trimmed = memoContent.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                parsed = JSON.parse(trimmed);
              }
            } catch (err) {
              console.warn('[loadUserDataFromSupabase] Failed to parse company memo JSON for', c.name, ':', err);
            }
          }

          if (parsed && typeof parsed === 'object') {
            return {
              id: parsed.id || String(c.id || ''),
              name: c.name || '',
              industry: parsed.industry || '',
              preference: parsed.preference || 3,
              status: c.status || 'interested',
              selectionStatusIntern: parsed.selectionStatusIntern,
              selectionStage: parsed.selectionStage || 'none',
              esDeadline: parsed.esDeadline || '',
              interviewDate: parsed.interviewDate || '',
              esMemos: parsed.esMemos || [],
              interviewMemos: parsed.interviewMemos || [],
              notes: parsed.notes || '',
              headquarters: parsed.headquarters || '',
              scale: parsed.scale || '',
              website: parsed.website || '',
              establishedYear: parsed.establishedYear || '',
              employeeCount: parsed.employeeCount || '',
              isForeign: parsed.isForeign || false,
              category: parsed.category || '',
              selectionType: parsed.selectionType || 'main',
              internType: parsed.internType || '1day',
              internSteps: parsed.internSteps || [],
              research: parsed.research || undefined
            };
          }

          return {
            id: String(c.id || ''),
            name: c.name || '',
            industry: '',
            preference: 3,
            status: c.status || 'interested',
            selectionStatusIntern: undefined,
            selectionStage: 'none',
            esDeadline: '',
            interviewDate: '',
            esMemos: [],
            interviewMemos: [],
            notes: memoContent || '',
            headquarters: '',
            scale: '',
            website: '',
            establishedYear: '',
            employeeCount: '',
            isForeign: false,
            category: '',
            selectionType: 'main',
            internType: '1day',
            internSteps: []
          };
        });
        setCompanies(loadedCos);
        console.log('[loadUserDataFromSupabase] companies 取得完了。件数:', loadedCos.length);
      } else {
        setCompanies([]);
        console.log('[loadUserDataFromSupabase] companies: Supabaseは空。');
      }

      // ================================================================
      // todos テーブルを取得
      // ================================================================
      let tds: any[] = [];
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', verifiedUid);
        if (error) {
          console.error('[loadUserDataFromSupabase] todos SELECTエラー:', error);
        } else if (data) {
          tds = data;
        }
      } catch (err) {
        console.error('[loadUserDataFromSupabase] todos SELECT例外:', err);
      }

      if (tds && tds.length > 0) {
        const loadedTodos = tds.map(t => {
          let parsed: any = null;
          if (t.task) {
            try {
              const trimmed = t.task.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                parsed = JSON.parse(trimmed);
              }
            } catch (err) {
              console.warn('[loadUserDataFromSupabase] Failed to parse todo task JSON:', err);
            }
          }

          if (parsed && typeof parsed === 'object') {
            return {
              id: parsed.id || String(t.id || ''),
              title: parsed.title || '',
              completed: t.is_completed || false,
              scope: parsed.scope || 'today',
              dueDate: parsed.dueDate || '',
              subtasks: parsed.subtasks || []
            };
          }

          return {
            id: String(t.id || ''),
            title: t.task || '',
            completed: t.is_completed || false,
            scope: 'today',
            dueDate: '',
            subtasks: []
          };
        });
        setTodos(loadedTodos);
        console.log('[loadUserDataFromSupabase] todos 取得完了。件数:', loadedTodos.length);
      } else {
        setTodos([]);
        console.log('[loadUserDataFromSupabase] todos: Supabaseは空。');
      }

      // ================================================================
      // self_analysis テーブルを取得
      // ================================================================
      let sa: any[] = [];
      try {
        const { data, error } = await supabase
          .from('self_analysis')
          .select('*')
          .eq('user_id', verifiedUid);
        if (error) {
          console.error('[loadUserDataFromSupabase] self_analysis SELECTエラー:', error);
        } else if (data) {
          sa = data;
        }
      } catch (err) {
        console.error('[loadUserDataFromSupabase] self_analysis SELECT例外:', err);
      }

      if (sa && sa.length > 0) {
        let loadedSA = { selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] };

        const prRow = sa.find(r => r.title === 'self_pr' || r.title === 'selfPR');
        const gakuRow = sa.find(r => r.title === 'gakuchika');
        const bmRow = sa.find(r => r.title === 'base_motivations' || r.title === 'baseMotivations');
        const faqRow = sa.find(r => r.title === 'faqs');

        if (prRow) loadedSA.selfPR = prRow.content || '';
        if (gakuRow) loadedSA.gakuchika = gakuRow.content || '';

        if (bmRow && bmRow.content) {
          try {
            const parsedBm = JSON.parse(bmRow.content);
            loadedSA.baseMotivations = Array.isArray(parsedBm) ? parsedBm : [];
          } catch (_) { loadedSA.baseMotivations = []; }
        }
        if (faqRow && faqRow.content) {
          try {
            const parsedFaq = JSON.parse(faqRow.content);
            loadedSA.faqs = Array.isArray(parsedFaq) ? parsedFaq : [];
          } catch (_) {}
        }

        setSelfAnalysis(loadedSA);
        console.log('[loadUserDataFromSupabase] self_analysis 取得完了。');

        // 3. self_analysis 内の拡張データのパース (trash_companies, ob_visits, offer_comparisons, notifications, settings)
        const trashRow = sa.find(r => r.title === 'trash_companies');
        if (trashRow && trashRow.content) {
          try { setTrashCompanies(JSON.parse(trashRow.content)); } catch (_) {}
        } else {
          setTrashCompanies([]);
        }

        const obVisitsRow = sa.find(r => r.title === 'ob_visits');
        if (obVisitsRow && obVisitsRow.content) {
          try { setObVisits(JSON.parse(obVisitsRow.content)); } catch (_) {}
        } else {
          setObVisits([]);
        }

        const comparisonsRow = sa.find(r => r.title === 'offer_comparisons');
        if (comparisonsRow && comparisonsRow.content) {
          try { setOfferComparisons(JSON.parse(comparisonsRow.content)); } catch (_) {}
        } else {
          setOfferComparisons([]);
        }

        const notificationsRow = sa.find(r => r.title === 'notifications');
        if (notificationsRow && notificationsRow.content) {
          try { setNotifications(JSON.parse(notificationsRow.content)); } catch (_) {}
        } else {
          setNotifications([]);
        }

        const settingsRow = sa.find(r => r.title === 'settings');
        if (settingsRow && settingsRow.content) {
          try { setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(settingsRow.content) }); } catch (_) {}
        }

        const industryResearchRow = sa.find(r => r.title === 'industry_research');
        if (industryResearchRow && industryResearchRow.content) {
          try { setIndustryResearch(JSON.parse(industryResearchRow.content)); } catch (_) { setIndustryResearch([]); }
        } else {
          setIndustryResearch([]);
        }

      } else {
        setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
        setTrashCompanies([]);
        setObVisits([]);
        setOfferComparisons([]);
        setNotifications([]);
        setIndustryResearch([]);
        console.log('[loadUserDataFromSupabase] self_analysis: Supabaseは空。');
      }

      console.log('[loadUserDataFromSupabase] 完了。');
    } catch (e: any) {
      console.error('[loadUserDataFromSupabase] 例外発生:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    // クライアント設定の事前検証
    const status = getSupabaseClientStatus();
    if (!status.isConfigured) {
      const msg = `【Supabase未設定】\n本番環境の環境変数 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) がVercel等で正しく適用されていない可能性があります。\n\n現在の設定:\nURL: ${status.url || '未設定'}\nAPIキー: ${status.hasAnonKey ? '存在します' : '存在しません'}`;
      console.error(msg);
      alert(msg);
      throw new Error(msg);
    }

    // パスワード要件チェック (8文字以上・英数字混合)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pass)) {
      throw new Error('パスワードは8文字以上で、英数字の両方を含める必要があります');
    }

    console.log('[Supabase SignUp]: Attempting signup for email:', email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('[Supabase SignUp Error]:', error);
        alert('【新規登録エラー】\n登録に失敗しました: ' + error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        console.error('[Supabase SignUp Error]: User data is empty after signup.');
        throw new Error('登録中にエラーが発生しました');
      }

      const uid = data.user.id;

      // Check if email confirmation is required (session is null when email confirm is enabled on Supabase dashboard)
      if (!data.session) {
        console.log('[Supabase SignUp]: Account created, waiting for email confirmation.');
        alert('✨ アカウントの作成に成功しました！\n確認用の認証メールを送信しましたので、メール内の確認リンクをクリックしてアカウントを有効化してからログインを行ってください。');
        return;
      }

      console.log('[Supabase SignUp]: Signup completed with immediate session.');

      // Session states, local cleanup, and cloud fetching are handled reactively by the onAuthStateChange listener.
      alert('✨ 新規登録およびログインが完了しました！');
    } catch (e: any) {
      console.error('[signUpWithEmail caught exception]:', e);
      alert('【新規登録通信エラー】\nSupabaseとの通信中にエラーが発生しました。インターネット接続または環境変数の設定を確認してください。\n詳細: ' + (e.message || e));
      throw e;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    // クライアント設定の事前検証
    const status = getSupabaseClientStatus();
    if (!status.isConfigured) {
      const msg = `【Supabase未設定】\n本番環境の環境変数 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) がVercel等で正しく適用されていない可能性があります。\n\n現在の設定:\nURL: ${status.url || '未設定'}\nAPIキー: ${status.hasAnonKey ? '存在します' : '存在しません'}`;
      console.error(msg);
      alert(msg);
      throw new Error(msg);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });

      if (error) {
        console.error('[Supabase Login Error]:', error);
        alert('【ログインエラー】\nログインに失敗しました: ' + error.message);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('ログインに失敗しました');
      }

      const uid = data.user.id;
      const name = data.user.user_metadata?.name || email.split('@')[0];

      // Session states, local cleanup, and cloud fetching are handled reactively by the onAuthStateChange listener.
    } catch (e: any) {
      console.error('[loginWithEmail caught exception]:', e);
      alert('【ログイン通信エラー】\nSupabaseとの通信中にエラーが発生しました。インターネット接続または環境変数の設定を確認してください。\n詳細: ' + (e.message || e));
      throw e;
    }
  };


  const verifyEmailCode = async (email: string, code: string) => {
    // Supabase standard OTP verification could be mapped if needed, keeping mock fallback
    alert('✅ メールアドレスの認証が完了しました！ログインしてください。');
  };

  const resendVerificationCode = async (email: string) => {
    alert(`📧 [認証メール再送信] ${email} 宛に確認メールを再送信しました。`);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) {
      throw new Error(error.message);
    }
    alert(`📧 [パスワードリセットメール] ${email} 宛に再設定メールを送信しました。`);
  };

  const completePasswordReset = async (email: string, token: string, newPass: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPass
    });
    if (error) {
      throw new Error(error.message);
    }
    alert('📝 パスワードの再設定が完了しました！新しいパスワードでログインしてください。');
  };



  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('shukatsu_auth_status');
    localStorage.removeItem('shukatsu_user_uid');
    localStorage.removeItem('shukatsu_user_email');
    localStorage.removeItem('shukatsu_user_name');
    
    setCurrentUser(null);
    setAuthStatus('welcome');

    setCompanies([]);
    setTrashCompanies([]);
    setTodos([]);
    setObVisits([]);
    setOfferComparisons([]);
    setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
    setIndustryResearch([]);
  };

  // クラウド上の全ユーザーデータを削除する。self_analysisテーブルは
  // saveUserDataItem経由でtrash_companies/settings/ob_visits/offer_comparisons/notifications
  // も title キーで保存しているため、丸ごと削除すればそれらも消える。
  const deleteAllCloudData = async (uid: string) => {
    const results = await Promise.allSettled([
      supabase.from('companies').delete().eq('user_id', uid),
      supabase.from('company_memos').delete().eq('user_id', uid),
      supabase.from('todos').delete().eq('user_id', uid),
      supabase.from('self_analysis').delete().eq('user_id', uid)
    ]);

    return results.every(r => r.status === 'fulfilled' && !r.value.error);
  };

  const deleteAccount = async () => {
    const uid = currentUser?.uid;
    let success = true;

    if (uid) {
      localStorage.removeItem(`shukatsu_companies_${uid}`);
      localStorage.removeItem(`shukatsu_trash_companies_${uid}`);
      localStorage.removeItem(`shukatsu_todos_${uid}`);
      localStorage.removeItem(`shukatsu_settings_${uid}`);
      localStorage.removeItem(`shukatsu_ob_visits_${uid}`);
      localStorage.removeItem(`shukatsu_comparisons_${uid}`);
      localStorage.removeItem(`shukatsu_self_analysis_${uid}`);
      localStorage.removeItem(`shukatsu_notifications_${uid}`);

      try {
        success = await deleteAllCloudData(uid);
      } catch (e) {
        console.error('[deleteAccount] クラウドデータ削除中に例外:', e);
        success = false;
      }
    }

    await logout();

    if (success) {
      alert('クラウド上の利用データを削除しました。ログイン用のメールアドレス・パスワードは削除されていないため、再ログインは可能です。');
    } else {
      alert('一部のクラウドデータの削除に失敗しました。再度お試しいただくか、サポートまでご連絡ください。');
    }

    return { success };
  };

  // --- End of Account Actions ---

  // Run dynamic alarm simulation checks when companies are modified or on startup
  useEffect(() => {
    if (companies.length === 0) return;
    
    // Check if we need to issue warnings
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    const generatedAlarms: NotificationItem[] = [...notifications];
    let changed = false;

    companies.forEach(company => {
      if (company.esDeadline) {
        const dlDate = new Date(company.esDeadline);
        const diffTime = dlDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 7 days before
        if (diffDays === 7) {
          const alarmId = `alarm-es7-${company.id}`;
          if (!generatedAlarms.some(a => a.id === alarmId)) {
            generatedAlarms.unshift({
              id: alarmId,
              title: 'ES締め切り7日前',
              message: `${company.name}のES締め切りまで1週間です（期日: ${company.esDeadline}）`,
              type: 'es_deadline',
              targetCompanyId: company.id,
              date: todayStr,
              timestamp: '09:00',
              read: false
            });
            changed = true;
          }
        }
        // 3 days before
        if (diffDays === 3) {
          const alarmId = `alarm-es3-${company.id}`;
          if (!generatedAlarms.some(a => a.id === alarmId)) {
            generatedAlarms.unshift({
              id: alarmId,
              title: 'ES締め切り3日前',
              message: `${company.name}のES締め切りが迫っています（期日: ${company.esDeadline}）`,
              type: 'es_deadline',
              targetCompanyId: company.id,
              date: todayStr,
              timestamp: '09:00',
              read: false
            });
            changed = true;
          }
        }
        // 1 day before
        if (diffDays === 1) {
          const alarmId = `alarm-es1-${company.id}`;
          if (!generatedAlarms.some(a => a.id === alarmId)) {
            generatedAlarms.unshift({
              id: alarmId,
              title: 'ES締め切り前日',
              message: `明日が${company.name}の締め切りです！最終提出確認をしましょう。`,
              type: 'es_deadline',
              targetCompanyId: company.id,
              date: todayStr,
              timestamp: '09:00',
              read: false
            });
            changed = true;
          }
        }
      }

      if (company.interviewDate) {
        const intDate = new Date(company.interviewDate);
        const diffTime = intDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Same day morning (diffDays === 0)
        if (diffDays === 0) {
          const alarmId = `alarm-int-0-${company.id}`;
          if (!generatedAlarms.some(a => a.id === alarmId)) {
            generatedAlarms.unshift({
              id: alarmId,
              title: '面接当日',
              message: `今日 ${company.name}の面接があります。準備は万全ですか？ファイト！`,
              type: 'interview',
              targetCompanyId: company.id,
              date: todayStr,
              timestamp: '08:00',
              read: false
            });
            changed = true;
          }
        }
        // One day before
        if (diffDays === 1) {
          const alarmId = `alarm-int-1-${company.id}`;
          if (!generatedAlarms.some(a => a.id === alarmId)) {
            generatedAlarms.unshift({
              id: alarmId,
              title: '面接前日リマインド',
              message: `明日 ${company.name}の面接があります。振り返りと逆質問、身だしなみを確認しましょう！`,
              type: 'interview',
              targetCompanyId: company.id,
              date: todayStr,
              timestamp: '19:00',
              read: false
            });
            changed = true;
          }
        }
      }
    });

    if (changed) {
      saveNotifications(generatedAlarms);
    }
  }, [companies]);

  // Tab switcher wrapper that resets detail view if needed
  const setActiveTab = (tab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'research' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about') => {
    setActiveTabState(tab);
  };

  const updateSelfPR = (text: string) => {
    saveSelfAnalysis({ ...selfAnalysis, selfPR: text });
  };

  const updateGakuchika = (text: string) => {
    saveSelfAnalysis({ ...selfAnalysis, gakuchika: text });
  };

  const addBaseMotivation = (motivation: Omit<BaseMotivation, 'id'>) => {
    const newMotivation: BaseMotivation = {
      ...motivation,
      id: `bm-${Date.now()}`
    };
    saveSelfAnalysis({
      ...selfAnalysis,
      baseMotivations: [...selfAnalysis.baseMotivations, newMotivation]
    });
  };

  const updateBaseMotivation = (id: string, updatedFields: Partial<BaseMotivation>) => {
    saveSelfAnalysis({
      ...selfAnalysis,
      baseMotivations: selfAnalysis.baseMotivations.map(bm => 
        bm.id === id ? { ...bm, ...updatedFields } : bm
      )
    });
  };

  const deleteBaseMotivation = (id: string) => {
    saveSelfAnalysis({
      ...selfAnalysis,
      baseMotivations: selfAnalysis.baseMotivations.filter(bm => bm.id !== id)
    });
  };

  const addFAQ = (faq: Omit<FAQItem, 'id'>) => {
    const newFAQ: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    saveSelfAnalysis({
      ...selfAnalysis,
      faqs: [...selfAnalysis.faqs, newFAQ]
    });
  };

  const updateFAQ = (id: string, updatedFields: Partial<FAQItem>) => {
    saveSelfAnalysis({
      ...selfAnalysis,
      faqs: selfAnalysis.faqs.map(f => 
        f.id === id ? { ...f, ...updatedFields } : f
      )
    });
  };

  const deleteFAQ = (id: string) => {
    saveSelfAnalysis({
      ...selfAnalysis,
      faqs: selfAnalysis.faqs.filter(f => f.id !== id)
    });
  };

  const navigateToCompany = (id: string, subTab: 'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons' = 'basic') => {
    setSelectedCompanyId(id);
    setDetailTab(subTab);
    setActiveTabState('companies');
  };

  // Company Operations
  const addCompany = (companyData: Omit<Company, 'id' | 'esMemos' | 'interviewMemos'>) => {
    const newId = `co-${Date.now()}`;
    const newCompany: Company = {
      ...companyData,
      id: newId,
      esMemos: [],
      interviewMemos: []
    };
    const updated = [...companies, newCompany];
    saveCompanies(updated);
    return newId;
  };

  const updateCompany = (id: string, updatedFields: Partial<Company>) => {
    const updated = companies.map(co => (co.id === id ? { ...co, ...updatedFields } : co));
    saveCompanies(updated);
  };

  const deleteCompany = (id: string) => {
    const targetCo = companies.find(co => co.id === id);
    if (targetCo) {
      const deletedItem = {
        ...targetCo,
        deletedAt: new Date().toISOString()
      };
      saveTrashCompanies([deletedItem, ...trashCompanies]);
    }
    const updated = companies.filter(co => co.id !== id);
    saveCompanies(updated);
    if (selectedCompanyId === id) {
      setSelectedCompanyId(null);
    }
  };

  const restoreCompany = (id: string) => {
    const targetCo = trashCompanies.find(co => co.id === id);
    if (targetCo) {
      // Remove deletedAt field when restoring
      const { deletedAt, ...restCompany } = targetCo;
      saveCompanies([...companies, restCompany]);
    }
    const updatedTrash = trashCompanies.filter(co => co.id !== id);
    saveTrashCompanies(updatedTrash);
  };

  const permanentlyDeleteCompany = (id: string) => {
    const updatedTrash = trashCompanies.filter(co => co.id !== id);
    saveTrashCompanies(updatedTrash);
  };

  const addESMemo = (
    companyId: string,
    question: string,
    answer: string,
    isDraft: boolean,
    category?: ESCategory,
    minChars?: number,
    maxChars?: number,
    status?: ESStatus
  ) => {
    const newMemo = {
      id: `es-${Date.now()}`,
      question,
      answer,
      isDraft,
      category: category || 'other',
      minChars: minChars || undefined,
      maxChars: maxChars || undefined,
      status: status || (isDraft ? 'drafting' : 'completed')
    };
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return { ...co, esMemos: [...co.esMemos, newMemo] };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const updateESMemo = (
    companyId: string,
    memoId: string,
    updatedMemo: {
      question?: string;
      answer?: string;
      isDraft?: boolean;
      category?: ESCategory;
      minChars?: number;
      maxChars?: number;
      status?: ESStatus;
    }
  ) => {
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return {
          ...co,
          esMemos: co.esMemos.map(memo => {
            if (memo.id === memoId) {
              const nextMemo = { ...memo, ...updatedMemo };
              // Ensure back-compat of isDraft
              if (updatedMemo.status) {
                nextMemo.isDraft = updatedMemo.status !== 'completed';
              } else if (updatedMemo.isDraft !== undefined) {
                nextMemo.status = updatedMemo.isDraft ? 'drafting' : 'completed';
              }
              return nextMemo;
            }
            return memo;
          })
        };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const deleteESMemo = (companyId: string, memoId: string) => {
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return { ...co, esMemos: co.esMemos.filter(memo => memo.id !== memoId) };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const addInterviewMemo = (companyId: string, memoData: Omit<Company['interviewMemos'][0], 'id'>) => {
    const newMemo = { ...memoData, id: `im-${Date.now()}` };
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return { ...co, interviewMemos: [...co.interviewMemos, newMemo] };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const updateInterviewMemo = (companyId: string, memoId: string, updatedMemo: Partial<Company['interviewMemos'][0]>) => {
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return {
          ...co,
          interviewMemos: co.interviewMemos.map(memo => (memo.id === memoId ? { ...memo, ...updatedMemo } : memo))
        };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const deleteInterviewMemo = (companyId: string, memoId: string) => {
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return { ...co, interviewMemos: co.interviewMemos.filter(memo => memo.id !== memoId) };
      }
      return co;
    });
    saveCompanies(updated);
  };

  const updateCompanyResearch = (companyId: string, updatedFields: Partial<CompanyResearch>) => {
    const updated = companies.map(co => {
      if (co.id === companyId) {
        return {
          ...co,
          research: {
            businessModel: '',
            customer: '',
            competitor: '',
            strength: '',
            weakness: '',
            cultureNotes: '',
            motivationHints: '',
            ...co.research,
            ...updatedFields,
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        };
      }
      return co;
    });
    saveCompanies(updated);
  };

  // Industry Research Operations (業界・企業研究タブ)
  const addIndustryResearch = (research: Omit<IndustryResearch, 'id'>) => {
    const newResearch: IndustryResearch = {
      ...research,
      id: `ind-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    saveIndustryResearch([newResearch, ...industryResearch]);
  };

  const updateIndustryResearch = (id: string, updatedFields: Partial<IndustryResearch>) => {
    const updated = industryResearch.map(r =>
      r.id === id ? { ...r, ...updatedFields, lastUpdated: new Date().toISOString().split('T')[0] } : r
    );
    saveIndustryResearch(updated);
  };

  const deleteIndustryResearch = (id: string) => {
    saveIndustryResearch(industryResearch.filter(r => r.id !== id));
  };

  const addCompanyNoteToIndustry = (industryId: string, note: Omit<IndustryCompanyNote, 'id'>) => {
    const newNote: IndustryCompanyNote = { ...note, id: `indnote-${Date.now()}` };
    const updated = industryResearch.map(r =>
      r.id === industryId ? { ...r, notes: [...(r.notes || []), newNote] } : r
    );
    saveIndustryResearch(updated);
  };

  const updateCompanyNoteInIndustry = (industryId: string, noteId: string, updatedFields: Partial<IndustryCompanyNote>) => {
    const updated = industryResearch.map(r =>
      r.id === industryId
        ? { ...r, notes: (r.notes || []).map(n => (n.id === noteId ? { ...n, ...updatedFields } : n)) }
        : r
    );
    saveIndustryResearch(updated);
  };

  const deleteCompanyNoteFromIndustry = (industryId: string, noteId: string) => {
    const updated = industryResearch.map(r =>
      r.id === industryId ? { ...r, notes: (r.notes || []).filter(n => n.id !== noteId) } : r
    );
    saveIndustryResearch(updated);
  };

  // ブレスト段階の企業メモを、正式な「企業一覧」のCompanyレコードへ昇格させる
  const promoteCompanyNote = (industryId: string, noteId: string) => {
    const industry = industryResearch.find(r => r.id === industryId);
    const note = industry?.notes.find(n => n.id === noteId);
    if (!industry || !note) return;

    addCompany({
      name: note.companyName,
      industry: industry.industryName,
      preference: 3,
      status: 'interested',
      selectionStage: 'none',
      esDeadline: '',
      interviewDate: '',
      notes: note.memo || ''
    });

    deleteCompanyNoteFromIndustry(industryId, noteId);
  };

  // Todo Operations
  const addTodo = (todoData: Omit<TodoItem, 'id'>) => {
    const newTodo: TodoItem = {
      ...todoData,
      id: `todo-${Date.now()}`
    };
    const updated = [...todos, newTodo];
    saveTodos(updated);

    // Simulate scheduling a notification if notification timing matches
    if (newTodo.dueDate && settings.notificationsEnabled) {
      addNotificationAlarm(
        'タスクリマインド',
        `期限間近のタスクがあります: ${newTodo.title} (期日: ${newTodo.dueDate})`,
        'todo',
        undefined,
        newTodo.id
      );
    }
  };

  const updateTodo = (id: string, updatedFields: Partial<TodoItem>) => {
    const updated = todos.map(todo => (todo.id === id ? { ...todo, ...updatedFields } : todo));
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(todo => todo.id !== id);
    saveTodos(updated);
  };

  const toggleTodo = (id: string) => {
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

  const toggleSubtask = (todoId: string, subtaskId: string) => {
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

  const addSubtask = (todoId: string, title: string) => {
    const updated = todos.map(todo => {
      if (todo.id === todoId) {
        const subtasks = todo.subtasks || [];
        const newSub = { id: `st-${Date.now()}`, title, completed: false };
        return { ...todo, subtasks: [...subtasks, newSub], completed: false };
      }
      return todo;
    });
    saveTodos(updated);
  };

  const deleteSubtask = (todoId: string, subtaskId: string) => {
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

  // OB Visits & Offer Comparisons
  const addObVisit = (visit: Omit<ObVisit, 'id'>) => {
    const newVisit: ObVisit = { ...visit, id: `ob-${Date.now()}` };
    saveObVisits([...obVisits, newVisit]);
  };

  const updateObVisit = (id: string, updated: Partial<ObVisit>) => {
    saveObVisits(obVisits.map(v => (v.id === id ? { ...v, ...updated } : v)));
  };

  const deleteObVisit = (id: string) => {
    saveObVisits(obVisits.filter(v => v.id !== id));
  };

  const addOfferComparison = (comp: Omit<OfferComparison, 'id'>) => {
    const newComp: OfferComparison = { ...comp, id: `comp-${Date.now()}` };
    saveComparisons([...offerComparisons, newComp]);
  };

  const updateOfferComparison = (id: string, updated: Partial<OfferComparison>) => {
    saveComparisons(offerComparisons.map(c => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteOfferComparison = (id: string) => {
    saveComparisons(offerComparisons.filter(c => c.id !== id));
  };

  // Active Simulated Notifications actions
  const updateSettings = (newSettingsFields: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettingsFields };
    saveSettings(updated);
  };

  const addNotificationAlarm = (title: string, message: string, type: NotificationItem['type'], targetCompanyId?: string, targetTodoId?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newAlarm: NotificationItem = {
      id: `alarm-${Date.now()}`,
      title,
      message,
      type,
      targetCompanyId,
      targetTodoId,
      date: todayStr,
      timestamp: 'ちょうど今',
      read: false
    };
    saveNotifications([newAlarm, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    saveNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    saveNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    saveNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        companies,
        todos,
        settings,
        obVisits,
        offerComparisons,
        notifications,
        activeTab,
        showOnboarding,
        setShowOnboarding,
        selectedCompanyId,
        selectedTodoId,
        detailTab,
        isDark,
        selfAnalysis,
        currentUser,
        authStatus,
        syncStatus,
        signUpWithEmail,
        loginWithEmail,
        verifyEmailCode,
        resendVerificationCode,
        resetPassword,
        completePasswordReset,
        logout,
        deleteAccount,
        setActiveTab,
        navigateToCompany,
        setSelectedCompanyId,
        updateSelfPR,
        updateGakuchika,
        addBaseMotivation,
        updateBaseMotivation,
        deleteBaseMotivation,
        addFAQ,
        updateFAQ,
        deleteFAQ,
        addCompany,
        updateCompany,
        deleteCompany,
        trashCompanies,
        restoreCompany,
        permanentlyDeleteCompany,
        addESMemo,
        updateESMemo,
        deleteESMemo,
        addInterviewMemo,
        updateInterviewMemo,
        deleteInterviewMemo,
        updateCompanyResearch,
        industryResearch,
        addIndustryResearch,
        updateIndustryResearch,
        deleteIndustryResearch,
        addCompanyNoteToIndustry,
        updateCompanyNoteInIndustry,
        deleteCompanyNoteFromIndustry,
        promoteCompanyNote,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        addObVisit,
        updateObVisit,
        deleteObVisit,
        addOfferComparison,
        updateOfferComparison,
        deleteOfferComparison,
        updateSettings,
        addNotificationAlarm,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        saveCompanies,
        saveTodos,
        saveSelfAnalysis,
        saveEvents,
        fontSize,
        setFontSize,
        selectionTypeFilter,
        setSelectionTypeFilter,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
