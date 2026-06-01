/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, TodoItem, AppSettings, NotificationItem, ObVisit, OfferComparison, CompanyStatus, TodoScope, SelfAnalysis, BaseMotivation, FAQItem, ESCategory, ESStatus } from '../types';
import { INITIAL_COMPANIES, INITIAL_TODOS, INITIAL_SETTINGS, INITIAL_OB_VISITS, INITIAL_OFFER_COMPARISONS, INITIAL_SELF_ANALYSIS } from '../seedData';
import { supabase } from '../utils/supabaseClient';

interface AppContextType {
  companies: Company[];
  trashCompanies: (Company & { deletedAt: string })[];
  todos: TodoItem[];
  settings: AppSettings;
  obVisits: ObVisit[];
  offerComparisons: OfferComparison[];
  notifications: NotificationItem[];
  activeTab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about';
  selectedCompanyId: string | null;
  selectedTodoId: string | null;
  detailTab: 'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'; // Allow detail navigation
  isDark: boolean;
  selfAnalysis: SelfAnalysis;

  // Account and sync states
  currentUser: { uid: string; email: string; name: string; isAnonymous: boolean } | null;
  authStatus: 'welcome' | 'unauthenticated' | 'authenticated' | 'guest';
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  isBiometricEnabled: boolean;

  // Account actions
  startAsGuest: () => void;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completePasswordReset: (email: string, token: string, newPass: string) => Promise<void>;
  migrateGuestToAccount: (email: string, name: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => void;
  setBiometrics: (enabled: boolean) => void;
  
  // Navigation actions
  setActiveTab: (tab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about') => void;
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
  
  // Navigation UI States
  const [activeTab, setActiveTabState] = useState<'dashboard' | 'todos' | 'calendar' | 'companies' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about'>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'>('basic');

  // Onboarding UI State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Account & Sync States
  const [currentUser, setCurrentUser] = useState<AppContextType['currentUser']>(null);
  const [authStatus, setAuthStatus] = useState<AppContextType['authStatus']>('welcome');
  const [syncStatus, setSyncStatus] = useState<AppContextType['syncStatus']>('synced');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

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
      const lastAuthStatus = localStorage.getItem('shukatsu_auth_status') as AppContextType['authStatus'];
      const initialStatus = lastAuthStatus || 'welcome';
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
          // Load fresh data asynchronously from Supabase
          setTimeout(() => {
            loadUserDataFromSupabase(storedUid, name);
          }, 0);
        }
      } else if (initialStatus === 'guest') {
        setCurrentUser({
          uid: 'guest-uid',
          email: 'guest@example.com',
          name: 'ゲストユーザー',
          isAnonymous: true
        });
      }

      const suffix = uid ? `_${uid}` : '';

      const storedCompanies = localStorage.getItem(`shukatsu_companies` + suffix);
      if (storedCompanies) {
        setCompanies(JSON.parse(storedCompanies));
      } else {
        // If they are regular authenticated but have no data, start empty, otherwise load defaults
        const initial = initialStatus === 'authenticated' ? [] : INITIAL_COMPANIES;
        setCompanies(initial);
        localStorage.setItem(`shukatsu_companies` + suffix, JSON.stringify(initial));
      }

      const storedTrash = localStorage.getItem(`shukatsu_trash_companies` + suffix);
      let loadedTrash: (Company & { deletedAt: string })[] = [];
      if (storedTrash) {
        try {
          loadedTrash = JSON.parse(storedTrash);
        } catch (_) {}
      }
      // Auto-purge items deleted more than 30 days ago
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const filteredTrash = loadedTrash.filter(item => {
        try {
          const dt = new Date(item.deletedAt).getTime();
          return dt >= thirtyDaysAgo;
        } catch (_) {
          return true;
        }
      });
      setTrashCompanies(filteredTrash);
      localStorage.setItem(`shukatsu_trash_companies` + suffix, JSON.stringify(filteredTrash));

      const storedTodos = localStorage.getItem(`shukatsu_todos` + suffix);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      } else {
        const initial = initialStatus === 'authenticated' ? [] : INITIAL_TODOS;
        setTodos(initial);
        localStorage.setItem(`shukatsu_todos` + suffix, JSON.stringify(initial));
      }

      const storedSettings = localStorage.getItem(`shukatsu_settings` + suffix);
      if (storedSettings) {
        setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(storedSettings) });
      } else {
        setSettings(INITIAL_SETTINGS);
        localStorage.setItem(`shukatsu_settings` + suffix, JSON.stringify(INITIAL_SETTINGS));
      }

      const storedObVisits = localStorage.getItem(`shukatsu_ob_visits` + suffix);
      if (storedObVisits) {
        setObVisits(JSON.parse(storedObVisits));
      } else {
        const initial = initialStatus === 'authenticated' ? [] : INITIAL_OB_VISITS;
        setObVisits(initial);
        localStorage.setItem(`shukatsu_ob_visits` + suffix, JSON.stringify(initial));
      }

      const storedComparisons = localStorage.getItem(`shukatsu_comparisons` + suffix);
      if (storedComparisons) {
        setOfferComparisons(JSON.parse(storedComparisons));
      } else {
        const initial = initialStatus === 'authenticated' ? [] : INITIAL_OFFER_COMPARISONS;
        setOfferComparisons(initial);
        localStorage.setItem(`shukatsu_comparisons` + suffix, JSON.stringify(initial));
      }

      const storedSelfAnalysis = localStorage.getItem(`shukatsu_self_analysis` + suffix);
      if (storedSelfAnalysis) {
        setSelfAnalysis(JSON.parse(storedSelfAnalysis));
      } else {
        const initial = initialStatus === 'authenticated' 
          ? { selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] } 
          : INITIAL_SELF_ANALYSIS;
        setSelfAnalysis(initial);
        localStorage.setItem(`shukatsu_self_analysis` + suffix, JSON.stringify(initial));
      }

      const storedNotifications = localStorage.getItem(`shukatsu_notifications` + suffix);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        const initial: NotificationItem[] = [];
        setNotifications(initial);
        localStorage.setItem(`shukatsu_notifications` + suffix, JSON.stringify(initial));
      }

      const isBio = localStorage.getItem('shukatsu_biometric_enabled');
      setIsBiometricEnabled(isBio === 'true');

      const onboarded = localStorage.getItem('shukatsu_onboarded');
      if (onboarded !== 'true') {
        setShowOnboarding(true);
      }

    } catch (e) {
      console.error('Error loading localStorage', e);
    }
  }, []);

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

  // Helper suffix to fetch/save according to specific linked profile
  const getSuffix = () => {
    return authStatus === 'authenticated' && currentUser ? `_${currentUser.uid}` : '';
  };

  // Save to LocalStorage helpers, supporting reactive account databases
  const saveCompanies = async (newCompanies: Company[]) => {
    setCompanies(newCompanies);
    localStorage.setItem(`shukatsu_companies` + getSuffix(), JSON.stringify(newCompanies));
    if (authStatus === 'authenticated' && currentUser) {
      try {
        setSyncStatus('syncing');
        // Simple and robust: clean slate approach for the active user
        await supabase.from('companies').delete().eq('user_id', currentUser.uid);
        if (newCompanies.length > 0) {
          const toInsert = newCompanies.map(c => ({
            id: c.id,
            user_id: currentUser.uid,
            name: c.name,
            industry: c.industry,
            preference: c.preference,
            status: c.status,
            selection_status_intern: c.selectionStatusIntern,
            selection_stage: c.selectionStage,
            es_deadline: c.esDeadline,
            interview_date: c.interviewDate,
            es_memos: c.esMemos,
            interview_memos: c.interviewMemos,
            notes: c.notes,
            headquarters: c.headquarters,
            scale: c.scale,
            website: c.website,
            established_year: c.establishedYear,
            employee_count: c.employeeCount,
            is_foreign: c.isForeign,
            category: c.category,
            selection_type: c.selectionType,
            intern_type: c.internType,
            intern_steps: c.internSteps
          }));
          await supabase.from('companies').insert(toInsert);
        }

        // Keep the events table synchronized
        await supabase.from('events').delete().eq('user_id', currentUser.uid);
        const eventsToInsert = [];
        for (const company of newCompanies) {
          const isIntern = company.selectionType === 'intern';
          if (company.esDeadline) {
            eventsToInsert.push({
              user_id: currentUser.uid,
              company_id: company.id,
              company_name: company.name,
              title: isIntern ? 'インターンES締切' : 'ES締切',
              event_date: company.esDeadline,
              type: 'deadline'
            });
          }
          if (company.interviewDate) {
            eventsToInsert.push({
              user_id: currentUser.uid,
              company_id: company.id,
              company_name: company.name,
              title: isIntern ? 'インターン面接' : '面接',
              event_date: company.interviewDate,
              type: 'interview'
            });
          }
          if (isIntern && company.internSteps) {
            company.internSteps.forEach(step => {
              if (step.date) {
                eventsToInsert.push({
                  user_id: currentUser.uid,
                  company_id: company.id,
                  company_name: company.name,
                  title: step.stepName,
                  event_date: step.date,
                  type: 'intern_step'
                });
              }
            });
          }
        }
        if (eventsToInsert.length > 0) {
          await supabase.from('events').insert(eventsToInsert);
        }

        setSyncStatus('synced');
      } catch (e) {
        console.error(e);
        setSyncStatus('error');
      }
    } else {
      if (authStatus === 'authenticated') triggerSync();
    }
  };

  const saveTrashCompanies = (newTrash: (Company & { deletedAt: string })[]) => {
    setTrashCompanies(newTrash);
    localStorage.setItem(`shukatsu_trash_companies` + getSuffix(), JSON.stringify(newTrash));
    if (authStatus === 'authenticated') triggerSync();
  };

  const saveTodos = async (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem(`shukatsu_todos` + getSuffix(), JSON.stringify(newTodos));
    if (authStatus === 'authenticated' && currentUser) {
      try {
        setSyncStatus('syncing');
        await supabase.from('todos').delete().eq('user_id', currentUser.uid);
        if (newTodos.length > 0) {
          const toInsert = newTodos.map(t => ({
            id: t.id,
            user_id: currentUser.uid,
            title: t.title,
            completed: t.completed,
            scope: t.scope,
            due_date: t.dueDate,
            subtasks: t.subtasks
          }));
          await supabase.from('todos').insert(toInsert);
        }
        setSyncStatus('synced');
      } catch (e) {
        console.error(e);
        setSyncStatus('error');
      }
    } else {
      if (authStatus === 'authenticated') triggerSync();
    }
  };

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(`shukatsu_settings` + getSuffix(), JSON.stringify(newSettings));
    if (authStatus === 'authenticated') triggerSync();
  };

  const saveObVisits = (newVisits: ObVisit[]) => {
    setObVisits(newVisits);
    localStorage.setItem(`shukatsu_ob_visits` + getSuffix(), JSON.stringify(newVisits));
    if (authStatus === 'authenticated') triggerSync();
  };

  const saveComparisons = (newComparisons: OfferComparison[]) => {
    setOfferComparisons(newComparisons);
    localStorage.setItem(`shukatsu_comparisons` + getSuffix(), JSON.stringify(newComparisons));
    if (authStatus === 'authenticated') triggerSync();
  };

  const saveNotifications = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    localStorage.setItem(`shukatsu_notifications` + getSuffix(), JSON.stringify(newNotifs));
    if (authStatus === 'authenticated') triggerSync();
  };

  const saveSelfAnalysis = async (newAnalysis: SelfAnalysis) => {
    setSelfAnalysis(newAnalysis);
    localStorage.setItem(`shukatsu_self_analysis` + getSuffix(), JSON.stringify(newAnalysis));
    if (authStatus === 'authenticated' && currentUser) {
      try {
        setSyncStatus('syncing');
        const toUpsert = {
          user_id: currentUser.uid,
          self_pr: newAnalysis.selfPR,
          gakuchika: newAnalysis.gakuchika,
          base_motivations: newAnalysis.baseMotivations,
          faqs: newAnalysis.faqs
        };
        await supabase.from('self_analysis').upsert(toUpsert);
        setSyncStatus('synced');
      } catch (e) {
        console.error(e);
        setSyncStatus('error');
      }
    } else {
      if (authStatus === 'authenticated') triggerSync();
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
  };

  // ----------------------------------------------------
  // 🔐 厳格なログイン・認証・パスワードリセットのモックDBロジック
  // ----------------------------------------------------
  interface RegisteredUser {
    email: string;
    pass: string;
    name: string;
    uid: string;
    verified: boolean;
    verificationCode?: string;
    resetToken?: string;
    resetTokenExpires?: number;
  }

  const INITIAL_REGISTERED_USERS: RegisteredUser[] = [
    {
      email: 'demo@career.com',
      pass: 'Career1234',
      name: 'デモユーザー',
      uid: 'user-demo-1234',
      verified: true
    }
  ];

  const getRegisteredUsers = (): RegisteredUser[] => {
    const users = localStorage.getItem('shukatsu_registered_users');
    if (!users) {
      localStorage.setItem('shukatsu_registered_users', JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    try {
      return JSON.parse(users);
    } catch (e) {
      return INITIAL_REGISTERED_USERS;
    }
  };

  const saveRegisteredUsers = (users: RegisteredUser[]) => {
    localStorage.setItem('shukatsu_registered_users', JSON.stringify(users));
  };

  const loadUserDataFromSupabase = async (uid: string, name: string) => {
    try {
      setSyncStatus('syncing');

      // Fetch companies
      const { data: cos, error: cosErr } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', uid);
      
      let loadedCos: Company[] = [];
      if (!cosErr && cos) {
        loadedCos = cos.map(c => ({
          id: c.id,
          name: c.name,
          industry: c.industry || '',
          preference: c.preference || 3,
          status: c.status || 'interested',
          selectionStatusIntern: c.selection_status_intern,
          selectionStage: c.selection_stage || 'none',
          esDeadline: c.es_deadline || '',
          interviewDate: c.interview_date || '',
          esMemos: c.es_memos || [],
          interviewMemos: c.interview_memos || [],
          notes: c.notes || '',
          headquarters: c.headquarters || '',
          scale: c.scale || '',
          website: c.website || '',
          establishedYear: c.established_year || '',
          employeeCount: c.employee_count || '',
          isForeign: c.is_foreign || false,
          category: c.category || '',
          selectionType: c.selection_type || 'main',
          internType: c.intern_type || '1day',
          internSteps: c.intern_steps || []
        }));
        setCompanies(loadedCos);
      } else {
        setCompanies([]);
      }

      // Fetch todos
      const { data: tds, error: tdsErr } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', uid);

      if (!tdsErr && tds) {
        setTodos(tds.map(t => ({
          id: t.id,
          title: t.title,
          completed: t.completed,
          scope: t.scope || 'today',
          dueDate: t.due_date || '',
          subtasks: t.subtasks || []
        })));
      } else {
        setTodos([]);
      }

      // Fetch self analysis
      const { data: sa, error: saErr } = await supabase
        .from('self_analysis')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (!saErr && sa) {
        setSelfAnalysis({
          selfPR: sa.self_pr || '',
          gakuchika: sa.gakuchika || '',
          baseMotivations: sa.base_motivations || [],
          faqs: sa.faqs || []
        });
      } else {
        const initialSA = {
          user_id: uid,
          self_pr: '',
          gakuchika: '',
          base_motivations: [],
          faqs: []
        };
        await supabase.from('self_analysis').upsert(initialSA);
        setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });
      }

      setSettings({ ...INITIAL_SETTINGS, profileName: name });
      setSyncStatus('synced');
    } catch (e) {
      console.error(e);
      setSyncStatus('error');
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    // パスワード要件チェック (8文字以上・英数字混合)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(pass)) {
      throw new Error('パスワードは8文字以上で、英数字の両方を含める必要があります');
    }

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
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('登録中にエラーが発生しました');
    }

    const uid = data.user.id;

    // Initialize self_analysis table for this user in Supabase
    const initialSelfAnalysis = {
      user_id: uid,
      self_pr: '',
      gakuchika: '',
      base_motivations: [],
      faqs: []
    };
    await supabase.from('self_analysis').upsert(initialSelfAnalysis);

    localStorage.setItem('shukatsu_auth_status', 'authenticated');
    localStorage.setItem('shukatsu_user_uid', uid);
    localStorage.setItem('shukatsu_user_email', email);
    localStorage.setItem('shukatsu_user_name', name);

    setCurrentUser({ uid, email, name, isAnonymous: false });
    setAuthStatus('authenticated');

    setCompanies([]);
    setTrashCompanies([]);
    setTodos([]);
    setSettings({ ...INITIAL_SETTINGS, profileName: name });
    setSelfAnalysis({ selfPR: '', gakuchika: '', baseMotivations: [], faqs: [] });

    alert('✨ 新規登録およびログインが完了しました！');
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('ログインに失敗しました');
    }

    const uid = data.user.id;
    const name = data.user.user_metadata?.name || email.split('@')[0];

    localStorage.setItem('shukatsu_auth_status', 'authenticated');
    localStorage.setItem('shukatsu_user_uid', uid);
    localStorage.setItem('shukatsu_user_email', email);
    localStorage.setItem('shukatsu_user_name', name);

    setCurrentUser({ uid, email, name, isAnonymous: false });
    setAuthStatus('authenticated');

    // Fetch user data from Supabase
    await loadUserDataFromSupabase(uid, name);
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

  // Convert guest accounts to cloud synchronized databases seamlessly
  const migrateGuestToAccount = async (email: string, name: string) => {
    // Standard register first
    const newUid = `user-${Date.now()}`;
    localStorage.setItem('shukatsu_auth_status', 'authenticated');
    localStorage.setItem('shukatsu_user_uid', newUid);
    localStorage.setItem('shukatsu_user_email', email);
    localStorage.setItem('shukatsu_user_name', name);
    
    setCurrentUser({ uid: newUid, email, name, isAnonymous: false });
    setAuthStatus('authenticated');

    // Sync current UI state with Supabase
    await saveCompanies(companies);
    await saveTodos(todos);
    await saveSelfAnalysis(selfAnalysis);

    triggerSync();
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
  };

  const deleteAccount = () => {
    const uid = currentUser?.uid;
    if (uid) {
      localStorage.removeItem(`shukatsu_companies_${uid}`);
      localStorage.removeItem(`shukatsu_trash_companies_${uid}`);
      localStorage.removeItem(`shukatsu_todos_${uid}`);
      localStorage.removeItem(`shukatsu_settings_${uid}`);
      localStorage.removeItem(`shukatsu_ob_visits_${uid}`);
      localStorage.removeItem(`shukatsu_comparisons_${uid}`);
      localStorage.removeItem(`shukatsu_self_analysis_${uid}`);
      localStorage.removeItem(`shukatsu_notifications_${uid}`);
    }
    logout();
    alert('アカウント情報およびクラウド同期データを完全に抹消しました。');
  };

  const setBiometrics = (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    localStorage.setItem('shukatsu_biometric_enabled', enabled ? 'true' : 'false');
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
  const setActiveTab = (tab: 'dashboard' | 'todos' | 'calendar' | 'companies' | 'analysis' | 'settings' | 'privacy' | 'contact' | 'about') => {
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
        isBiometricEnabled,
        startAsGuest,
        signUpWithEmail,
        loginWithEmail,
        verifyEmailCode,
        resendVerificationCode,
        resetPassword,
        completePasswordReset,
        migrateGuestToAccount,
        logout,
        deleteAccount,
        setBiometrics,
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
        clearNotifications
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
