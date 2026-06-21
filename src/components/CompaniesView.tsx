/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { 
  Building2, 
  PlusCircle,
  Plus, 
  Trash2, 
  RotateCcw,
  Star, 
  ChevronRight, 
  Shield,
  Clock, 
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  FileText,
  User,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Award,
  TrendingDown,
  Percent,
  Copy,
  DollarSign,
  Sparkles,
  X,
  ArrowUpRight,
  Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Company, CompanyStatus, SelectionStage, ESQuestionMemo, InterviewMemo, ESCategory, ESStatus, InternStatus, InternType, InternStep } from '../types';
import { MASTER_COMPANIES } from '../constants/companies';
import { supabase } from '../utils/supabaseClient';
import { getDisplayRepresentation } from '../utils/selfAnalysis';

export default function CompaniesView() {
  const { 
    companies, 
    settings, 
    selectedCompanyId, 
    detailTab, 
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
    setSelectedCompanyId,
    obVisits,
    addObVisit,
    deleteObVisit,
    offerComparisons,
    addOfferComparison,
    deleteOfferComparison,
    isDark,
    selfAnalysis,
    saveCompanies
  } = useApp();

  const theme = getTheme(settings.themeColor);

  // Layout navigation states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [activeTab, setActiveTabState] = useState<'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'>(detailTab as any || 'basic');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // New selection view tabs & intern status-specific filters
  const [selectionTab, setSelectionTab] = useState<'main' | 'intern' | 'all'>('main');
  const [filterStatusIntern, setFilterStatusIntern] = useState<InternStatus | 'all'>('all');

  // 新しい「日系のみ」「外資系のみ」「両方（すべて）」フィルター
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'domestic' | 'foreign'>('all');

  // 管理者モード用の State 郡
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminCompanies, setAdminCompanies] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [editingMasterCompany, setEditingMasterCompany] = useState<any | null>(null);

  // 新マスター企業のフォーム状態
  const [mName, setMName] = useState('');
  const [mEnglishName, setMEnglishName] = useState('');
  const [mIndustry, setMIndustry] = useState('');
  const [mHeadquarters, setMHeadquarters] = useState('');
  const [mScale, setMScale] = useState('大手企業');
  const [mWebsite, setMWebsite] = useState('');
  const [mRecruitmentUrl, setMRecruitmentUrl] = useState('');
  const [mEstablishedYear, setMEstablishedYear] = useState('');
  const [mEmployeeCount, setMEmployeeCount] = useState('');
  const [mIsForeign, setMIsForeign] = useState(false);
  const [mCategory, setMCategory] = useState('日系大手');

  // フィードバックモーダル状態
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [fbType, setFbType] = useState('incorrect_info');
  const [fbComment, setFbComment] = useState('');
  const [fbEmail, setFbEmail] = useState('');

  // ----------------------------------------------------
  // 🛡️ 管理者ダッシュボード・フィードバックデータのフェッチ関数郡
  // ----------------------------------------------------
  const loadAdminData = async () => {
    try {
      const res1 = await fetch('/api/admin/companies');
      if (res1.ok) {
        const data = await res1.json();
        setAdminCompanies(data);
      }
      const res2 = await fetch('/api/admin/feedbacks');
      if (res2.ok) {
        const data = await res2.json();
        setFeedbacks(data);
      }
    } catch (err) {
      console.error("Failed to fetch administrative records:", err);
    }
  };

  const handleAddMasterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) {
      alert('企業名は必須項目です。');
      return;
    }
    try {
      const res = await fetch('/api/admin/companies/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mName,
          englishName: mEnglishName,
          industry: mIndustry,
          headquarters: mHeadquarters,
          scale: mScale,
          website: mWebsite,
          recruitmentUrl: mRecruitmentUrl,
          establishedYear: mEstablishedYear,
          employeeCount: mEmployeeCount,
          isForeign: mIsForeign,
          category: mCategory
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '新規登録に失敗しました。');
        return;
      }
      alert('✨ 企業マスターデータへ新しい企業を追加登録しました！');
      setShowAddMasterModal(false);
      resetMasterForm();
      loadAdminData();
    } catch (err) {
      alert('サーバーエラーが発生しました。');
    }
  };

  const handleUpdateMasterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMasterCompany || !mName.trim()) {
      alert('会社名がありません。');
      return;
    }
    try {
      const res = await fetch('/api/admin/companies/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMasterCompany.id || editingMasterCompany.corporateNumber,
          name: mName,
          englishName: mEnglishName,
          industry: mIndustry,
          headquarters: mHeadquarters,
          scale: mScale,
          website: mWebsite,
          recruitmentUrl: mRecruitmentUrl,
          establishedYear: mEstablishedYear,
          employeeCount: mEmployeeCount,
          isForeign: mIsForeign,
          category: mCategory
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'マスター編集に失敗しました。');
        return;
      }
      alert('📝 企業マスター情報を修正更新しました。');
      setEditingMasterCompany(null);
      resetMasterForm();
      loadAdminData();
    } catch (err) {
      alert('サーバーエラーが発生しました。');
    }
  };

  const handleDeleteMasterCompany = async (id: string, name: string) => {
    if (!window.confirm(`「${name}」のマスターデータを削除してもよろしいですか？\n※削除すると検索サジェストに表示されなくなります。`)) return;
    try {
      const res = await fetch('/api/admin/companies/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        alert('🗑️ 企業マスターから削除しました。');
        loadAdminData();
      } else {
        const data = await res.json();
        alert(data.error || '削除失敗。');
      }
    } catch (err) {
      alert('サーバーエラーが発生しました。');
    }
  };

  const handleAutoUpdateMaster = async () => {
    try {
      const res = await fetch('/api/admin/companies/auto-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✨ 定期自動更新が完了しました！\n以下の ${data.updatedCompanies.length} 社のマスターデータを最新情報に更新、最終更新日（タイムスタンプ）をセットしました:\n・${data.updatedCompanies.join('\n・')}`);
        loadAdminData();
      } else {
        alert('自動同期更新失敗。');
      }
    } catch (err) {
      alert('サーバーエラーが発生しました。');
    }
  };

  const handleResolveFeedback = async (id: string, remove: boolean = false) => {
    try {
      const res = await fetch('/api/admin/feedbacks/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolved: true, remove })
      });
      if (res.ok) {
        alert(remove ? '🚮 不正確の指摘報告を破棄削除しました。' : '✅ 報告に対処チェック（解決済マーク）を入れました。');
        loadAdminData();
      } else {
        alert('解決済みへの更新に失敗しました。');
      }
    } catch (err) {
      alert('サーバー連携でエラー。');
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      const res = await fetch('/api/company/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          companyName: company.name,
          feedbackType: fbType,
          comment: fbComment,
          email: fbEmail
        })
      });
      if (res.ok) {
        alert('🙌 こまやかな情報報告ありがとうございます！管理者アカウントに、不正確・古い情報のフィードバックがしっかりと送信されました。内容を確認のうえマスターDBへ修正反映を行います。');
        setShowFeedbackModal(false);
        setFbComment('');
        setFbEmail('');
      } else {
        alert('フィードバックの送信に失敗しました。');
      }
    } catch (err) {
      alert('ネットワークエラー。');
    }
  };

  const resetMasterForm = () => {
    setMName('');
    setMEnglishName('');
    setMIndustry('');
    setMHeadquarters('');
    setMScale('大手企業');
    setMWebsite('');
    setMRecruitmentUrl('');
    setMEstablishedYear('');
    setMEmployeeCount('');
    setMIsForeign(false);
    setMCategory('日系大手');
  };

  const startEditMaster = (comp: any) => {
    setEditingMasterCompany(comp);
    setMName(comp.name || '');
    setMEnglishName(comp.englishName || '');
    setMIndustry(comp.industry || '');
    setMHeadquarters(comp.headquarters || '');
    setMScale(comp.scale || '大手企業');
    setMWebsite(comp.website || '');
    setMRecruitmentUrl(comp.recruitmentUrl || '');
    setMEstablishedYear(comp.establishedYear || '');
    setMEmployeeCount(comp.employeeCount || '');
    setMIsForeign(!!comp.isForeign);
    setMCategory(comp.category || (comp.isForeign ? '外資系コンサル' : '日系大手'));
  };

  // Search, filter, and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<CompanyStatus | 'all'>('all');
  const [filterPreference, setFilterPreference] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'preference' | 'deadline' | 'status' | 'industry'>('newest');

  // New Company form states
  const [newSelectionType, setNewSelectionType] = useState<'main' | 'intern'>('main');
  const [newInternStatus, setNewInternStatus] = useState<InternStatus>('entry_done');
  const [newInternType, setNewInternType] = useState<InternType>('1day');
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newPreference, setNewPreference] = useState(3);
  const [newStatus, setNewStatus] = useState<CompanyStatus>('interested');
  const [newEsDeadline, setNewEsDeadline] = useState('');
  const [newInterviewDate, setNewInterviewDate] = useState('');
  const [newSelectionStage, setNewSelectionStage] = useState<SelectionStage>('none');
  const [newIsForeign, setNewIsForeign] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLastUpdated, setNewLastUpdated] = useState('');

  // New simplified autocomplete and AI extraction states
  const [newHeadquarters, setNewHeadquarters] = useState('');
  const [newScale, setNewScale] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newEstablishedYear, setNewEstablishedYear] = useState('');
  const [newEmployeeCount, setNewEmployeeCount] = useState('');
  const [suggestions, setSuggestions] = useState<{
    name: string;
    industry: string;
    headquarters: string;
    scale: string;
    website: string;
    establishedYear?: string;
    employeeCount?: string;
    corporateNumber?: string;
    source?: string;
    isForeign?: boolean;
    lastUpdated?: string;
    category?: string;
  }[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Recently searched companies
  const [recentlySearched, setRecentlySearched] = useState<{
    name: string;
    industry: string;
    headquarters: string;
    scale: string;
    website: string;
    establishedYear?: string;
    employeeCount?: string;
    isForeign?: boolean;
    lastUpdated?: string;
    category?: string;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('shunavi_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const addToRecentlySearched = (company: {
    name: string;
    industry: string;
    headquarters: string;
    scale: string;
    website: string;
    establishedYear?: string;
    employeeCount?: string;
    isForeign?: boolean;
    lastUpdated?: string;
    category?: string;
  }) => {
    if (!company.name || !company.name.trim()) return;
    setRecentlySearched(prev => {
      // Deduplicate by name
      const filtered = prev.filter(item => item.name.toLowerCase() !== company.name.toLowerCase());
      const updated = [company, ...filtered].slice(0, 5);
      localStorage.setItem('shunavi_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromRecentlySearched = (companyName: string) => {
    setRecentlySearched(prev => {
      const updated = prev.filter(item => item.name.toLowerCase() !== companyName.toLowerCase());
      localStorage.setItem('shunavi_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlySearched = () => {
    setRecentlySearched([]);
    localStorage.removeItem('shunavi_recent_searches');
  };

  const [isInputFocused, setIsInputFocused] = useState(false);

  React.useEffect(() => {
    const q = newName.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    const normalize = (str: string): string => {
      if (!str) return "";
      let val = str.trim().toLowerCase();
      // Zenkaku alphanumeric to Hankaku
      val = val.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
      // Convert Katakana to Hiragana
      val = val.replace(/[\u30a1-\u30f6]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0x60);
      });
      // Strip hyphens, spaces, brackets, long vowel markers
      val = val.replace(/[ー々・ヶ\-\s\(\)（）]/g, "");
      return val;
    };

    const normQ = normalize(q);
    if (!normQ) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        // Query Supabase for companies where user_id is null and name contains the input (case-insensitive)
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .is('user_id', null)
          .ilike('name', `%${q}%`)
          .limit(10);

        if (!error && data && data.length > 0) {
          const mapped = data.map(item => ({
            name: item.name,
            industry: item.industry || '',
            headquarters: item.headquarters || '',
            scale: item.scale || '',
            website: item.website || '',
            establishedYear: item.established_year || '',
            employeeCount: item.employee_count || '',
            isForeign: item.is_foreign || false,
            category: item.category || '',
            lastUpdated: item.last_updated || '',
            corporateNumber: item.corporate_number || ''
          }));
          setSuggestions(mapped);
          return;
        }
      } catch (err) {
        console.error('Error fetching master companies from Supabase:', err);
      }

      // Offline / Error / Empty result fallback: Search against local MASTER_COMPANIES
      const scored = MASTER_COMPANIES.map(comp => {
        let score = 0;
        const compNameNorm = normalize(comp.name);
        
        // Exact match
        if (compNameNorm === normQ) {
          score += 100;
        }
        // Starts with
        else if (compNameNorm.startsWith(normQ)) {
          score += 50;
        }
        // Contains
        else if (compNameNorm.includes(normQ)) {
          score += 30;
        }

        // Check website
        const websiteLower = (comp.website || "").toLowerCase();
        if (websiteLower.includes(q.toLowerCase())) {
          score += 20;
        }

        // Check industry & category
        const indNorm = normalize(comp.industry);
        const catNorm = normalize(comp.category || "");
        if (indNorm.includes(normQ) || catNorm.includes(normQ)) {
          score += 10;
        }

        return { comp, score };
      });

      const matches = scored
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.comp)
        .slice(0, 10);

      setSuggestions(matches);
    };

    fetchSuggestions();
  }, [newName]);

  // ES copy tool helper states
  const [showImportES, setShowImportES] = useState(false);
  const [showImportSelfAnalysis, setShowImportSelfAnalysis] = useState(false);
  const [esSearchQuery, setEsSearchQuery] = useState('');
  const [esFilterCategory, setEsFilterCategory] = useState<ESCategory | 'all'>('all');

  // Intern to Main conversion states
  const [showConvertToMainModal, setShowConvertToMainModal] = useState(false);
  const [carryOverES, setCarryOverES] = useState(true);
  const [carryOverInterviews, setCarryOverInterviews] = useState(true);
  const [carryOverNotes, setCarryOverNotes] = useState(true);

  // New ES Memo Form states
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newIsDraft, setNewIsDraft] = useState(true);
  const [newESCategory, setNewESCategory] = useState<ESCategory>('other');
  const [newESMinChars, setNewESMinChars] = useState<string>('');
  const [newESMaxChars, setNewESMaxChars] = useState<string>('');
  const [newESStatus, setNewESStatus] = useState<ESStatus>('not_started');

  // Inline ES Question Answering Editor states
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState('');
  const [editingAnswer, setEditingAnswer] = useState('');
  const [editingCategory, setEditingCategory] = useState<ESCategory>('other');
  const [editingMinChars, setEditingMinChars] = useState<string>('');
  const [editingMaxChars, setEditingMaxChars] = useState<string>('');
  const [editingStatus, setEditingStatus] = useState<ESStatus>('not_started');

  // New Intern Selection step tracking states
  const [newStepName, setNewStepName] = useState('');
  const [newStepDate, setNewStepDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStepResult, setNewStepResult] = useState<'selecting' | 'passed' | 'rejected' | 'none'>('none');
  const [newStepNotes, setNewStepNotes] = useState('');
  const [showAddStepForm, setShowAddStepForm] = useState(false);

  // Intern-to-Main Handoff helper states
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffCopyES, setHandoffCopyES] = useState(true);
  const [handoffCopyInterview, setHandoffCopyInterview] = useState(true);
  const [handoffCopyNotes, setHandoffCopyNotes] = useState(true);

  // New Interview Form states
  const [newIntDate, setNewIntDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newIntStage, setNewIntStage] = useState('一次面接');
  const [newIntFormat, setNewIntFormat] = useState<'individual' | 'group' | 'other'>('individual');
  const [newIntQ, setNewIntQ] = useState('');
  const [newIntA, setNewIntA] = useState('');
  const [newIntReflections, setNewIntReflections] = useState('');
  const [newIntImprovements, setNewIntImprovements] = useState('');
  const [newIntNextPrep, setNewIntNextPrep] = useState('');

  // OB visit form states
  const [newObName, setNewObName] = useState('');
  const [newObDept, setNewObDept] = useState('');
  const [newObDate, setNewObDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newObNotes, setNewObNotes] = useState('');

  // Offer comparison form states
  const [newCompSalary, setNewCompSalary] = useState(250000);
  const [newCompBenefits, setNewCompBenefits] = useState('');
  const [newCompRole, setNewCompRole] = useState('');
  const [newCompCommute, setNewCompCommute] = useState('');
  const [newCompPros, setNewCompPros] = useState('');
  const [newCompCons, setNewCompCons] = useState('');
  const [newCompRank, setNewCompRank] = useState(1);

  // active company details focus object reference
  const company = companies.find(c => c.id === selectedCompanyId);

  // Status mappings in Japanese
  const STATUS_LABELS: Record<CompanyStatus, string> = {
    interested: '興味あり',
    es_planned: 'ES提出予定',
    es_submitted: 'ES提出済み',
    selecting: '選考中',
    offered: '内定',
    rejected: '不合格'
  };

  const STATUS_COLORS: Record<CompanyStatus, { bg: string; text: string; border: string }> = {
    interested: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
    es_planned: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    es_submitted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    selecting: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    offered: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  };

  const STAGE_LABELS: Record<SelectionStage, string> = {
    none: '未定(ES作成など)',
    applied: '応募完了',
    document_passed: '書類通過',
    interview_1: '一次面接中',
    interview_2: '二次面接中',
    interview_final: '最終選考中',
    offered: '内定獲得'
  };

  const INTERN_STATUS_LABELS: Record<InternStatus, string> = {
    entry_done: 'エントリー済み',
    es_submitted: 'ES提出済み',
    selecting: '選考中',
    passed: '合格',
    rejected: '不合格'
  };

  const INTERN_STATUS_COLORS: Record<InternStatus, { bg: string; text: string; border: string }> = {
    entry_done: { bg: 'bg-gray-100/60', text: 'text-gray-650', border: 'border-gray-200' },
    es_submitted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    selecting: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    passed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  };

  const INTERN_TYPE_LABELS: Record<InternType, string> = {
    '1day': '1day',
    'multi_day': '複数日',
    'long_term': '長期'
  };

  const ES_CATEGORY_LABELS: Record<ESCategory, string> = {
    self_pr: '自己PR',
    gakuchika: 'ガクチカ',
    motivation: '志望動機',
    other: 'その他'
  };

  const ES_STATUS_LABELS: Record<ESStatus, string> = {
    not_started: '未着手',
    drafting: '下書き中',
    completed: '完成'
  };

  // Set default tabs if requested by context
  React.useEffect(() => {
    if (detailTab) {
      setActiveTabState(detailTab as any);
    }
  }, [detailTab]);

  // Form handlers
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIndustry.trim()) return;

    const newId = `co-${Date.now()}`;
    const newCompany: Company = {
      id: newId,
      name: newName,
      industry: newIndustry,
      preference: newPreference,
      status: newSelectionType === 'main' ? newStatus : 'interested',
      selectionStatusIntern: newSelectionType === 'intern' ? newInternStatus : undefined,
      selectionStage: newSelectionStage,
      esDeadline: newEsDeadline,
      interviewDate: newInterviewDate,
      notes: '',
      headquarters: newHeadquarters,
      scale: newScale,
      website: newWebsite,
      selectionType: newSelectionType,
      internType: newSelectionType === 'intern' ? newInternType : undefined,
      internSteps: [],
      establishedYear: newEstablishedYear,
      employeeCount: newEmployeeCount,
      isForeign: newIsForeign,
      category: newCategory,
      lastUpdated: newLastUpdated || new Date().toISOString().split('T')[0],
      esMemos: [],
      interviewMemos: []
    };

    const updated = [...companies, newCompany];
    saveCompanies(updated);

    // Dynamically post search registration to server shared corpus for auto-incremental database lookup
    fetch('/api/company/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        industry: newIndustry,
        headquarters: newHeadquarters,
        scale: newScale,
        website: newWebsite,
        establishedYear: newEstablishedYear,
        employeeCount: newEmployeeCount,
        isForeign: newIsForeign,
        category: newCategory
      })
    }).catch(err => console.warn("Failed to synchronize corporate addition to shared database:", err));

    // Save item into recently searched company history
    addToRecentlySearched({
      name: newName,
      industry: newIndustry,
      headquarters: newHeadquarters,
      scale: newScale,
      website: newWebsite,
      establishedYear: newEstablishedYear,
      employeeCount: newEmployeeCount,
      isForeign: newIsForeign,
      lastUpdated: newLastUpdated || new Date().toISOString().split('T')[0],
      category: newCategory
    });

    // Reset fields
    setNewName('');
    setNewIndustry('');
    setNewPreference(3);
    setNewStatus('interested');
    setNewInternStatus('entry_done');
    setNewInternType('1day');
    setNewEsDeadline('');
    setNewInterviewDate('');
    setNewSelectionStage('none');
    setNewHeadquarters('');
    setNewScale('');
    setNewWebsite('');
    setNewEstablishedYear('');
    setNewEmployeeCount('');
    setNewIsForeign(false);
    setNewCategory('');
    setNewLastUpdated('');
    
    setShowAddCompanyModal(false);
    setSelectedCompanyId(newId);
    setActiveTabState('basic');
  };

  const handleConvertToMain = () => {
    if (!company) return;

    // Create a new Main application
    const newId = addCompany({
      name: company.name,
      industry: company.industry,
      preference: company.preference,
      status: 'interested',
      selectionStage: 'none',
      notes: carryOverNotes ? company.notes || '' : '',
      headquarters: company.headquarters || '',
      scale: company.scale || '',
      website: company.website || '',
      selectionType: 'main',
      esDeadline: company.esDeadline || '',
      interviewDate: company.interviewDate || '',
      internSteps: []
    });

    // Carry over ES memos if selected
    if (carryOverES && company.esMemos && company.esMemos.length > 0) {
      company.esMemos.forEach(es => {
        addESMemo(
          newId,
          es.question,
          es.answer,
          es.isDraft,
          es.category || 'other',
          es.minChars,
          es.maxChars,
          es.status || 'not_started'
        );
      });
    }

    // Carry over Interview memos if selected
    if (carryOverInterviews && company.interviewMemos && company.interviewMemos.length > 0) {
      company.interviewMemos.forEach(im => {
        addInterviewMemo(
          newId,
          im.title,
          im.content,
          im.date
        );
      });
    }

    // Carry over OB visits if any
    if (carryOverNotes) {
      obVisits.filter(ob => ob.companyId === company.id).forEach(ob => {
        addObVisit(newId, ob.visitorName, ob.department, ob.date, ob.memo);
      });
    }

    // Switch view scope context
    setShowConvertToMainModal(false);
    setSelectionTab('main');
    setSelectedCompanyId(newId);
    setActiveTabState('basic');
  };

  const handleCreateESMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newQuestion.trim() || !newAnswer.trim()) return;

    const minNum = newESMinChars ? parseInt(newESMinChars) : undefined;
    const maxNum = newESMaxChars ? parseInt(newESMaxChars) : undefined;

    addESMemo(
      company.id,
      newQuestion,
      newAnswer,
      newESStatus !== 'completed',
      newESCategory,
      minNum,
      maxNum,
      newESStatus
    );

    setNewQuestion('');
    setNewAnswer('');
    setNewIsDraft(true);
    setNewESCategory('other');
    setNewESMinChars('');
    setNewESMaxChars('');
    setNewESStatus('not_started');
  };

  const handleCreateInterviewMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    addInterviewMemo(company.id, {
      date: newIntDate,
      stageName: newIntStage,
      format: newIntFormat,
      questionsAndAnswers: [{ q: newIntQ, a: newIntA }],
      reflections: newIntReflections,
      improvements: newIntImprovements,
      nextPrep: newIntNextPrep
    });

    // Reset Fields
    setNewIntStage('一次面接');
    setNewIntQ('');
    setNewIntA('');
    setNewIntReflections('');
    setNewIntImprovements('');
    setNewIntNextPrep('');
  };

  // OB visit handler
  const handleCreateObVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newObName.trim() || !newObDept.trim()) return;

    addObVisit({
      companyId: company.id,
      alumniName: newObName,
      department: newObDept,
      visitDate: newObDate,
      notes: newObNotes
    });

    setNewObName('');
    setNewObDept('');
    setNewObNotes('');
  };

  // Offer condition compare handler
  const handleCreateComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    addOfferComparison({
      companyId: company.id,
      baseSalary: Number(newCompSalary),
      benefits: newCompBenefits,
      role: newCompRole,
      commuteTime: newCompCommute,
      pros: newCompPros,
      cons: newCompCons,
      rank: Number(newCompRank)
    });

    setNewCompBenefits('');
    setNewCompRole('');
    setNewCompCommute('');
    setNewCompPros('');
    setNewCompCons('');
  };

  // ES Import tool copy executor: copying a selected ES from another company to the current company
  const handleImportESAction = (sourceMemo: ESQuestionMemo, sourceCompName: string) => {
    if (!company) return;
    addESMemo(company.id, `【流用元: ${sourceCompName}】${sourceMemo.question}`, sourceMemo.answer, true);
    setShowImportES(false);
  };

  // Gather dynamic industry suggestions
  const industriesList = Array.from(new Set(companies.map(c => c.industry).filter(Boolean)));

  // Filter logic
  const filteredCompanies = companies.filter(co => {
    // Separate by Selection Type tab
    const coType = co.selectionType || 'main';
    if (selectionTab !== 'all' && coType !== selectionTab) {
      return false;
    }

    // 1. Search Cross-keyword (including ES memos and interview questions & answers)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = co.name.toLowerCase().includes(q);
      const matchIndustry = co.industry.toLowerCase().includes(q);
      const matchNotes = (co.notes || '').toLowerCase().includes(q);
      
      const matchES = co.esMemos?.some(memo => 
         memo.question.toLowerCase().includes(q) || 
         memo.answer.toLowerCase().includes(q)
      );

      const matchInterview = co.interviewMemos?.some(intv => 
        intv.stageName.toLowerCase().includes(q) ||
        intv.questionsAndAnswers?.some(qa => qa.q.toLowerCase().includes(q) || qa.a.toLowerCase().includes(q)) ||
        (intv.reflections || '').toLowerCase().includes(q) ||
        (intv.improvements || '').toLowerCase().includes(q)
      );

      if (!matchName && !matchIndustry && !matchNotes && !matchES && !matchInterview) {
        return false;
      }
    }

    // 2. Status Match
    if (selectionTab === 'main') {
      if (filterStatus !== 'all' && co.status !== filterStatus) {
        return false;
      }
    } else if (selectionTab === 'intern') {
      const coInternStatus = co.selectionStatusIntern || 'entry_done';
      if (filterStatusIntern !== 'all' && coInternStatus !== filterStatusIntern) {
        return false;
      }
    }

    // 3. Industry Match
    if (filterIndustry !== 'all' && co.industry !== filterIndustry) {
      return false;
    }

    // 4. Preference Match
    if (filterPreference !== 'all' && co.preference < Number(filterPreference)) {
      return false;
    }

    // 5. Origin Match (日系 vs 外資系)
    if (filterOrigin !== 'all') {
      const isCoForeign = !!co.isForeign;
      if (filterOrigin === 'foreign' && !isCoForeign) return false;
      if (filterOrigin === 'domestic' && isCoForeign) return false;
    }

    return true;
  });

  // Sort logic
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.esDeadline) return 1;
      if (!b.esDeadline) return -1;
      return new Date(a.esDeadline).getTime() - new Date(b.esDeadline).getTime();
    }
    if (sortBy === 'preference') {
      return b.preference - a.preference;
    }
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'industry') {
      return a.industry.localeCompare(b.industry, 'ja');
    }
    if (sortBy === 'status') {
      if (selectionTab === 'main') {
        const statusOrder: Record<CompanyStatus, number> = {
          interested: 0,
          es_planned: 1,
          es_submitted: 2,
          selecting: 3,
          offered: 4,
          rejected: 5
        };
        return statusOrder[a.status] - statusOrder[b.status];
      } else if (selectionTab === 'intern') {
        const statusOrderIntern: Record<InternStatus, number> = {
          entry_done: 0,
          es_submitted: 1,
          selecting: 2,
          passed: 3,
          rejected: 4
        };
        const statusA = a.selectionStatusIntern || 'entry_done';
        const statusB = b.selectionStatusIntern || 'entry_done';
        return statusOrderIntern[statusA] - statusOrderIntern[statusB];
      } else {
        const getUnifiedStatusOrder = (co: Company) => {
          const type = co.selectionType || 'main';
          if (type === 'main') {
            const mainOrder: Record<CompanyStatus, number> = {
              interested: 0,
              es_planned: 1,
              es_submitted: 2,
              selecting: 3,
              offered: 4,
              rejected: 5
            };
            return mainOrder[co.status] || 0;
          } else {
            const internOrder: Record<InternStatus, number> = {
              entry_done: 0,
              es_submitted: 2,
              selecting: 3,
              passed: 4,
              rejected: 5
            };
            const status = co.selectionStatusIntern || 'entry_done';
            return internOrder[status] || 0;
          }
        };
        return getUnifiedStatusOrder(a) - getUnifiedStatusOrder(b);
      }
    }
    return 0;
  });

  // Grouped Companies lookup on sorted/filtered set
  const companyGroups: Record<CompanyStatus, Company[]> = {
    interested: [],
    es_planned: [],
    es_submitted: [],
    selecting: [],
    offered: [],
    rejected: []
  };

  const companyGroupsIntern: Record<InternStatus, Company[]> = {
    entry_done: [],
    es_submitted: [],
    selecting: [],
    passed: [],
    rejected: []
  };

  sortedCompanies.forEach(co => {
    if (selectionTab === 'intern') {
      const status = co.selectionStatusIntern || 'entry_done';
      companyGroupsIntern[status].push(co);
    } else if (selectionTab === 'main') {
      companyGroups[co.status].push(co);
    }
  });

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence mode="wait">
        {!selectedCompanyId ? (
          /* --- COMPANY LIST TAB --- */
          <motion.div
            key="list-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 animate-fade-in"
          >
            {/* Top selectionType Segment Switch */}
            <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-2xl gap-1 w-full max-w-[480px] border border-gray-200/50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectionTab('main');
                  setSelectedCompanyId(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectionTab === 'main'
                    ? `${theme.bg} text-white shadow-xs`
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-slate-200'
                }`}
              >
                💼 本選考
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionTab('intern');
                  setSelectedCompanyId(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectionTab === 'intern'
                    ? `${theme.bg} text-white shadow-xs`
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-slate-200'
                }`}
              >
                🎖️ インターン選考
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionTab('all');
                  setSelectedCompanyId(null);
                }}
                className={`flex-1 py-1.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  selectionTab === 'all'
                    ? `${theme.bg} text-white shadow-xs`
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-slate-200'
                }`}
              >
                📊 すべての企業
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-left">
                <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>企業別管理</h2>
                <p className="text-xs text-gray-400 mt-0.5">登録企業の選考状態、ES、面接ログを一元管理できます</p>
              </div>

              <div className="flex items-center gap-2">
                {/* View toggle helper segment control */}
                {selectionTab !== 'all' && (
                  <div className={`flex rounded-lg p-0.5 border ${
                    isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-100/60 border-gray-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setViewMode('grouped')}
                      className={`text-[10px] py-1 px-2.5 rounded-md font-bold cursor-pointer transition-all ${
                        viewMode === 'grouped'
                          ? (isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-900 shadow-3xs')
                          : 'text-gray-400 hover:text-gray-650'
                      }`}
                    >
                      ステータス別
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`text-[10px] py-1 px-2.5 rounded-md font-bold cursor-pointer transition-all ${
                        viewMode === 'list'
                          ? (isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-900 shadow-3xs')
                          : 'text-gray-400 hover:text-gray-650'
                      }`}
                    >
                      一覧
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setShowAddCompanyModal(true)}
                  className={`flex items-center gap-1 text-[10px] font-black py-1.5 px-3 rounded-lg text-white cursor-pointer transition-all ${theme.bg} ${theme.hover} shadow-xs mr-1.5 md:mr-2`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  企業を追加
                </button>

                <button
                  onClick={() => setShowTrashModal(true)}
                  className={`flex items-center gap-1 text-[10px] font-black py-1.5 px-3 rounded-lg border cursor-pointer transition-all ${
                    isDark 
                      ? 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-100' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                  } shadow-xs`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  ゴミ箱 ({trashCompanies.length})
                </button>
              </div>
            </div>

            {/* --- Filter & Search Controls --- */}
            <div className={`p-4 rounded-3xl border ${
              isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50/50 border-gray-100'
            } space-y-3 text-xs`}>
              <div className="flex flex-col md:flex-row gap-2.5">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="企業名や業界、ES・面接の言葉で串刺し検索..."
                    className={`w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 transition-all ${
                      isDark ? 'bg-slate-900/40 border-slate-800 focus:border-sky-400 text-white' : 'focus:border-sky-400 text-gray-950'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  <div className="relative">
                    <select
                      value={filterOrigin}
                      onChange={e => setFilterOrigin(e.target.value as any)}
                      className={`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 ${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }`}
                    >
                      <option value="all">企業出自：すべて</option>
                      <option value="domestic">日系企業のみ</option>
                      <option value="foreign">外資系企業のみ</option>
                    </select>
                  </div>

                  <div className="relative">
                    {selectionTab === 'main' ? (
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value as any)}
                        className={`w-full px-2.5 py-2 text-[10px] line-clamp-1 bg-white rounded-xl border border-gray-200 ${
                          isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                        }`}
                      >
                        <option value="all">選考：すべて</option>
                        <option value="interested">検討中</option>
                        <option value="es_planned">ES作成予定</option>
                        <option value="es_submitted">ES提出済</option>
                        <option value="selecting">選考中</option>
                        <option value="offered">内定</option>
                        <option value="rejected">選考終了</option>
                      </select>
                    ) : selectionTab === 'intern' ? (
                      <select
                        value={filterStatusIntern}
                        onChange={e => setFilterStatusIntern(e.target.value as any)}
                        className={`w-full px-2.5 py-2 text-[10px] line-clamp-1 bg-white rounded-xl border border-gray-200 ${
                          isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                        }`}
                      >
                        <option value="all">選考：すべて</option>
                        <option value="entry_done">エントリー済み</option>
                        <option value="es_submitted">ES提出済み</option>
                        <option value="selecting">選考中</option>
                        <option value="passed">合格</option>
                        <option value="rejected">不合格</option>
                      </select>
                    ) : (
                      <select
                        disabled
                        className={`w-full px-2.5 py-2 text-[10px] line-clamp-1 bg-gray-50/80 dark:bg-slate-905/40 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-400`}
                      >
                        <option>選考フィルター：無効</option>
                      </select>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={filterPreference}
                      onChange={e => setFilterPreference(e.target.value as any)}
                      className={`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 ${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }`}
                    >
                      <option value="all">志望度：すべて</option>
                      <option value="5">★★★★★</option>
                      <option value="4">★★★★</option>
                      <option value="3">★★★</option>
                      <option value="2">★★</option>
                      <option value="1">★</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterIndustry}
                      onChange={e => setFilterIndustry(e.target.value)}
                      className={`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 ${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }`}
                    >
                      <option value="all">業界：すべて</option>
                      {industriesList.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className={`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 ${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }`}
                    >
                      <option value="newest">追加：新しい順</option>
                      <option value="preference">志望度順</option>
                      <option value="deadline">締切近い順</option>
                      <option value="status">選考フェーズ順</option>
                      <option value="industry">業界順</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Convert Intern to Main Application Modal (visible when showConvertToMainModal is true) */}
            {showConvertToMainModal && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowConvertToMainModal(false)} />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-gray-100 z-10 space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5 font-sans">
                      <Network className="h-4 w-4 text-indigo-600" />
                      <span>本選考データへの追加・引き継ぎ</span>
                    </h3>
                    <button 
                      onClick={() => setShowConvertToMainModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full cursor-pointer hover:bg-gray-150"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4 text-xs text-left font-sans">
                    <p className="text-gray-600 leading-relaxed font-sans">
                      インターンエントリー企業 <strong>{company?.name}</strong> の選考データを本選考管理画面へと移行・追加します。
                      引き継ぎたい項目を選択して「本選考データを新規作成する」を押してください。
                    </p>

                    <div className="p-3.5 bg-gray-50 border border-gray-150 rounded-2xl space-y-3">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={carryOverES}
                          onChange={e => setCarryOverES(e.target.checked)}
                          className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div>
                          <span className="font-bold text-gray-800">エントリーシート回答データの引き継ぎ</span>
                          <span className="block text-[10px] text-gray-500">登録済みの設問メモ（{company?.esMemos?.length || 0}件）を引き継ぎます</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none border-t border-gray-100 pt-3">
                        <input 
                          type="checkbox"
                          checked={carryOverInterviews}
                          onChange={e => setCarryOverInterviews(e.target.checked)}
                          className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div>
                          <span className="font-bold text-gray-800">面接記録メモデータの引き継ぎ</span>
                          <span className="block text-[10px] text-gray-500">登録済みの面接詳細メモ（{company?.interviewMemos?.length || 0}件）を引き継ぎます</span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none border-t border-gray-100 pt-3">
                        <input 
                          type="checkbox"
                          checked={carryOverNotes}
                          onChange={e => setCarryOverNotes(e.target.checked)}
                          className="h-4 w-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <div>
                          <span className="font-bold text-gray-800">OB訪問・基本備考メモの引き継ぎ</span>
                          <span className="block text-[10px] text-gray-500">自由形式メモや登録済みのOB訪問詳細データを引き継ぎます</span>
                        </div>
                      </label>
                    </div>

                    <p className="text-[10px] text-amber-600 leading-normal flex items-start gap-1 font-sans">
                      <span>※</span>
                      <span>本操作を行うと、本選考管理画面に新しく「検討中（興味あり）」として企業レコードが追加されます。現在のインターン用データもそのまま残ります。</span>
                    </p>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowConvertToMainModal(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-750 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleConvertToMain}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
                      >
                        本選考データを新規作成する
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Add Company Modal Form (visible when showAddCompanyModal is true) */}
            {showAddCompanyModal && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowAddCompanyModal(false)} />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white text-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative border border-gray-100 z-10 space-y-4"
                >
                  <div className="flex justify-between items-center sm:pb-1">
                    <h3 className="text-sm font-black text-gray-900">🏢 新しい企業を登録</h3>
                    <button 
                      onClick={() => setShowAddCompanyModal(false)}
                      className="text-gray-450 hover:text-gray-755 transition-colors p-1 rounded-full cursor-pointer hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs text-left">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">企業名</label>
                      <input 
                        type="text"
                        required
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="（例）株式会社未来テクノロジー"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">業界</label>
                        <select
                          required
                          value={newIndustry}
                          onChange={e => setNewIndustry(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                        >
                          <option value="">選択してください</option>
                          <option value="メーカー（素材・食品・医薬品・自動車・電子機器など）">メーカー（素材・食品・医薬品・自動車・電子機器など）</option>
                          <option value="商社（総合商社・専門商社）">商社（総合商社・専門商社）</option>
                          <option value="金融（銀行・証券・保険・カードなど）">金融（銀行・証券・保険・カードなど）</option>
                          <option value="小売・流通（百貨店・スーパー・コンビニ・専門専門店など）">小売・流通（百貨店・スーパー・コンビニ・専門専門店など）</option>
                          <option value="サービス・インフラ（鉄道・航空・エネルギー・旅行・ホテルなど）">サービス・インフラ（鉄道・航空・エネルギー・旅行・ホテルなど）</option>
                          <option value="ソフトウェア・通信（IT・通信・インターネット・ゲームなど）">ソフトウェア・通信（IT・通信・インターネット・ゲームなど）</option>
                          <option value="マスコミ・メディア（テレビ・新聞・出版・広告など）">マスコミ・メディア（テレビ・新聞・出版・広告など）</option>
                          <option value="官公庁・公社・団体">官公庁・公社・団体</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">企業出自</label>
                        <select
                          value={newIsForeign ? 'foreign' : 'domestic'}
                          onChange={e => setNewIsForeign(e.target.value === 'foreign')}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 font-bold"
                        >
                          <option value="domestic">日系企業</option>
                          <option value="foreign">外資系企業</option>
                        </select>
                      </div>
                    </div>

                    {/* Selection Division Segment Selector */}
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">選考区分</label>
                      <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl gap-1 w-full">
                        <button
                          type="button"
                          onClick={() => setNewSelectionType('main')}
                          className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all cursor-pointer ${
                            newSelectionType === 'main'
                              ? `${theme.lightBg} ${theme.textDark} shadow-3xs`
                              : 'text-gray-500 hover:text-gray-850'
                          }`}
                        >
                          💼 本選考
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSelectionType('intern')}
                          className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition-all cursor-pointer ${
                            newSelectionType === 'intern'
                              ? `${theme.lightBg} ${theme.textDark} shadow-3xs`
                              : 'text-gray-500 hover:text-gray-850'
                          }`}
                        >
                          🎖️ インターン選考
                        </button>
                      </div>
                    </div>

                    {newSelectionType === 'main' ? (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">ステータス</label>
                          <select
                            value={newStatus}
                            onChange={e => setNewStatus(e.target.value as CompanyStatus)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="interested">興味あり</option>
                            <option value="es_planned">ES作成予定</option>
                            <option value="es_submitted">ES提出済</option>
                            <option value="selecting">選考中</option>
                            <option value="offered">内定</option>
                            <option value="rejected">不合格</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">選考状況段階</label>
                          <select
                            value={newSelectionStage}
                            onChange={e => setNewSelectionStage(e.target.value as any)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="none">未設定（初期段階）</option>
                            <option value="applied">書類作成中 / 応募完了</option>
                            <option value="document_passed">書類通過</option>
                            <option value="interview_1">一次選考/面接</option>
                            <option value="interview_2">二次選考/面接</option>
                            <option value="interview_final">最終面接</option>
                            <option value="offered">内定</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">インターン種別</label>
                          <select
                            value={newInternType}
                            onChange={e => setNewInternType(e.target.value as InternType)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="1day">1day</option>
                            <option value="multi_day">複数日</option>
                            <option value="long_term">長期</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">選考ステータス</label>
                          <select
                            value={newInternStatus}
                            onChange={e => setNewInternStatus(e.target.value as InternStatus)}
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                          >
                            <option value="entry_done">エントリー済み</option>
                            <option value="es_submitted">ES提出済み</option>
                            <option value="selecting">選考中</option>
                            <option value="passed">合格</option>
                            <option value="rejected">不合格</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">志望度</label>
                        <div className="flex gap-1.5 h-10 items-center pl-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewPreference(star)}
                              className="text-gray-300 hover:text-amber-400 cursor-pointer transition-colors"
                            >
                              <Star className={`h-5 w-5 ${newPreference >= star ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">ES締切日</label>
                        <input 
                          type="date"
                          value={newEsDeadline}
                          onChange={e => setNewEsDeadline(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">面接予定日</label>
                      <input 
                        type="date"
                        value={newInterviewDate}
                        onChange={e => setNewInterviewDate(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!newName.trim() || !newIndustry.trim()}
                      className={`w-full py-3 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs ${theme.bg} ${theme.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      企業を追加する
                    </button>
                  </form>
                </motion.div>
              </div>
            )}

            {/* --- COMPANY LIST RENDERING --- */}
            {selectionTab === 'all' ? (
              <div className="overflow-x-auto w-full rounded-3xl border border-gray-150 dark:border-slate-800 shadow-3xs bg-white dark:bg-slate-900">
                <table className="w-full text-left border-collapse min-w-[700px] text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'} font-bold`}>
                      <th className="py-3.5 px-4 font-black">企業名</th>
                      <th className="py-3.5 px-4 font-black">業界</th>
                      <th className="py-3.5 px-4 font-black">選考状況</th>
                      <th className="py-3.5 px-4 font-black">志望度</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-gray-100'}`}>
                    {sortedCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 font-sans">
                          登録されている企業はありません
                        </td>
                      </tr>
                    ) : (
                      sortedCompanies.map((co) => {
                        const isMain = (co.selectionType || 'main') === 'main';
                        const design = isMain 
                          ? STATUS_COLORS[co.status]
                          : INTERN_STATUS_COLORS[co.selectionStatusIntern || 'entry_done'];
                        
                        return (
                          <tr
                            key={co.id}
                            onClick={() => {
                              setSelectedCompanyId(co.id);
                              setActiveTabState('basic');
                            }}
                            className={`hover:bg-gray-55/65 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                              isDark ? 'text-slate-350 border-slate-800/50' : 'text-gray-750 border-gray-100'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold max-w-[280px] truncate">
                              <div className="flex items-center gap-2">
                                <span className={isDark ? 'text-slate-200' : 'text-gray-900'}>{co.name}</span>
                                <div className="flex gap-1 shrink-0">
                                  {co.isForeign ? (
                                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 rounded-sm text-[8px] font-black leading-none">
                                      外資系
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/50 dark:border-sky-900/40 rounded-sm text-[8px] font-black leading-none">
                                      日系
                                    </span>
                                  )}
                                  {isMain ? (
                                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/40 rounded-sm text-[8px] font-black leading-none">
                                      本選考
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/40 rounded-sm text-[8px] font-black leading-none">
                                      インターン
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-sans text-gray-500 dark:text-slate-400">
                              {co.industry}
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <span className={`inline-block px-2 py-0.5 rounded-sm text-[9px] font-black uppercase text-center border ${design.bg} ${design.text} ${design.border}`}>
                                {isMain 
                                  ? STATUS_LABELS[co.status]
                                  : INTERN_STATUS_LABELS[co.selectionStatusIntern || 'entry_done']}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-sans">
                              <span className="flex items-center gap-0.5">
                                {[...Array(co.preference)].map((_, i) => (
                                  <Star key={i} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                                ))}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {sortedCompanies.length === 0 ? (
                  <div className={`py-12 text-center text-xs space-y-2 rounded-2xl border border-dashed ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    <p>該当する企業は見つかりませんでした</p>
                    <p className="text-[10px] text-gray-450 font-sans">検索・フィルター条件を調整してください</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sortedCompanies.map((co, index) => {
                      const design = selectionTab === 'main' 
                        ? STATUS_COLORS[co.status]
                        : INTERN_STATUS_COLORS[co.selectionStatusIntern || 'entry_done'];
                      return (
                        <React.Fragment key={co.id}>
                          <div
                            onClick={() => {
                              setSelectedCompanyId(co.id);
                              setActiveTabState('basic');
                            }}
                            className={`p-4 rounded-3xl border shadow-3xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group text-left ${
                              isDark 
                                ? `bg-slate-900 border-slate-800/80 hover:border-${settings.themeColor}-400` 
                                : `bg-white border-gray-100 hover:border-${settings.themeColor}-200`
                            }`}
                          >
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-xs font-bold truncate transition-colors ${
                                  isDark ? 'text-slate-100 group-hover:text-white' : 'text-gray-950 group-hover:text-black'
                                }`}>
                                  {co.name}
                                </h4>
                                {co.isForeign ? (
                                  <span className="px-1 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 rounded-sm text-[8px] font-black leading-none">
                                    外資系
                                  </span>
                                ) : (
                                  <span className="px-1 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/50 dark:border-sky-900/40 rounded-sm text-[8px] font-black leading-none">
                                    日系
                                  </span>
                                )}
                                {selectionTab === 'main' ? (
                                  <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase text-center border ${design.bg} ${design.text} ${design.border}`}>
                                    {STATUS_LABELS[co.status]}
                                  </span>
                                ) : (
                                  <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase text-center border ${design.bg} ${design.text} ${design.border}`}>
                                    {INTERN_STATUS_LABELS[co.selectionStatusIntern || 'entry_done']}
                                  </span>
                                )}
                                {selectionTab === 'intern' && co.internType && (
                                  <span className="px-1.5 py-0.5 bg-gray-150 text-gray-750 text-[8.5px] font-bold rounded-sm">
                                    {INTERN_TYPE_LABELS[co.internType]}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1.5 truncate">
                                <span>{co.industry}</span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 font-sans">
                                  {[...Array(co.preference)].map((_, i) => (
                                    <Star key={i} className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                                  ))}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5 font-sans">
                                {co.esDeadline && (
                                  <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                    isDark ? 'bg-rose-950/45 text-rose-300 border border-rose-900' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                  }`}>
                                    <Clock className="h-2.5 w-2.5" />
                                    締切: {co.esDeadline}
                                  </span>
                                )}
                                {co.interviewDate && (
                                  <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                    isDark ? 'bg-blue-950/45 text-blue-300 border border-blue-900' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}>
                                    <Calendar className="h-2.5 w-2.5" />
                                    面接: {co.interviewDate}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* --- Status grouped lists showing with badges count --- */
              <div className="space-y-6">
                {selectionTab === 'main' ? (
                  (['interested', 'es_planned', 'es_submitted', 'selecting', 'offered', 'rejected'] as CompanyStatus[]).map(status => {
                    const groupCompanies = companyGroups[status];
                    const design = STATUS_COLORS[status];

                    return (
                      <div key={status} className="space-y-2.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-750 flex items-center gap-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-center border mr-1 ${design.bg} ${design.text} ${design.border}`}>
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="font-mono font-bold text-gray-400">({groupCompanies.length})</span>
                          </span>
                        </div>

                        {groupCompanies.length === 0 ? (
                          <div className={`py-3 px-4 text-center text-[10px] text-gray-400 rounded-2xl border ${
                            isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-gray-50'
                          }`}>
                            このステータスに該当する企業はありません
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {groupCompanies.map(co => (
                              <div
                                key={co.id}
                                onClick={() => {
                                  setSelectedCompanyId(co.id);
                                  setActiveTabState('basic');
                                }}
                                className={`p-3.5 rounded-2xl border shadow-3xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${
                                  isDark 
                                    ? `bg-slate-900 border-slate-800 hover:border-${settings.themeColor}-400` 
                                    : `bg-white border-gray-100 hover:border-${settings.themeColor}-200`
                                }`}
                              >
                                <div className="space-y-1 min-w-0">
                                  <h4 className={`text-xs font-bold truncate group-hover:${theme.text} transition-colors ${
                                    isDark ? 'text-slate-100 font-sans' : 'text-gray-950 font-sans'
                                  }`}>
                                    {co.name}
                                  </h4>
                                  {co.isForeign ? (
                                    <span className="px-1 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 rounded-sm text-[8px] font-black leading-none">
                                      外資系
                                    </span>
                                  ) : (
                                    <span className="px-1 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/50 dark:border-sky-900/40 rounded-sm text-[8px] font-black leading-none">
                                      日系
                                    </span>
                                  )}
                                  <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1.5 truncate">
                                    <span>{co.industry}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5">
                                      {[...Array(co.preference)].map((_, i) => (
                                        <Star key={i} className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                                      ))}
                                    </span>
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 pt-1 font-sans">
                                    {co.esDeadline && (
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                        isDark ? 'bg-rose-950/45 text-rose-300 border border-rose-900' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                      }`}>
                                        <Clock className="h-2.5 w-2.5" />
                                        締切: {co.esDeadline}
                                      </span>
                                    )}
                                    {co.interviewDate && (
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                        isDark ? 'bg-blue-950/45 text-blue-300 border border-blue-900' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                      }`}>
                                        <Calendar className="h-2.5 w-2.5" />
                                        面接: {co.interviewDate}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  (['entry_done', 'es_submitted', 'selecting', 'passed', 'rejected'] as InternStatus[]).map(status => {
                    const groupCompanies = companyGroupsIntern[status];
                    const design = INTERN_STATUS_COLORS[status];

                    return (
                      <div key={status} className="space-y-2.5 text-left font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-750 flex items-center gap-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase text-center border mr-1 ${design.bg} ${design.text} ${design.border}`}>
                              {INTERN_STATUS_LABELS[status]}
                            </span>
                            <span className="font-mono font-bold text-gray-400">({groupCompanies.length})</span>
                          </span>
                        </div>

                        {groupCompanies.length === 0 ? (
                          <div className={`py-3 px-4 text-center text-[10px] text-gray-400 rounded-2xl border ${
                            isDark ? 'bg-slate-900/10 border-slate-800' : 'bg-white border-gray-50'
                          }`}>
                            このステータスに該当するインターンはありません
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-sans">
                            {groupCompanies.map(co => (
                              <div
                                key={co.id}
                                onClick={() => {
                                  setSelectedCompanyId(co.id);
                                  setActiveTabState('basic');
                                }}
                                className={`p-3.5 rounded-2xl border shadow-3xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group ${
                                  isDark 
                                    ? `bg-slate-900 border-slate-800 hover:border-${settings.themeColor}-400` 
                                    : `bg-white border-gray-100 hover:border-${settings.themeColor}-200`
                                }`}
                              >
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className={`text-xs font-bold truncate group-hover:${theme.text} transition-colors ${
                                      isDark ? 'text-slate-100' : 'text-gray-950'
                                    }`}>
                                      {co.name}
                                    </h4>
                                    {co.isForeign ? (
                                      <span className="px-1 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40 rounded-sm text-[8px] font-black leading-none">
                                        外資系
                                      </span>
                                    ) : (
                                      <span className="px-1 py-0.5 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/50 dark:border-sky-900/40 rounded-sm text-[8px] font-black leading-none">
                                        日系
                                      </span>
                                    )}
                                    <span className="px-1.5 py-0.5 bg-gray-150 text-gray-700 text-[8px] font-bold rounded-sm">
                                      {co.internType ? INTERN_TYPE_LABELS[co.internType] : '1day'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 font-sans flex items-center gap-1.5 truncate">
                                    <span>{co.industry}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5">
                                      {[...Array(co.preference)].map((_, i) => (
                                        <Star key={i} className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                                      ))}
                                    </span>
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 pt-1 font-sans">
                                    {co.esDeadline && (
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                        isDark ? 'bg-rose-950/45 text-rose-300 border border-rose-900' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                      }`}>
                                        <Clock className="h-2.5 w-2.5" />
                                        締切: {co.esDeadline}
                                      </span>
                                    )}
                                    {co.interviewDate && (
                                      <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono ${
                                        isDark ? 'bg-blue-950/45 text-blue-300 border border-blue-900' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                      }`}>
                                        <Calendar className="h-2.5 w-2.5" />
                                        面接: {co.interviewDate}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* --- COMPANY DETAIL VIEW SCREEN (4 tabs + OB visit / Compare extensions in tabs) --- */
          <motion.div
            key="detail-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header: Company title back button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-start gap-3 min-w-0">
                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className="p-1 px-1.5 mt-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-700 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-gray-900 truncate">
                      {company?.name}
                    </h2>
                    {company?.isForeign ? (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded text-[9px] font-black">
                        外資系
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-100/50 rounded text-[9px] font-black">
                        日系
                      </span>
                    )}
                    <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full border ${STATUS_COLORS[company!.status].bg} ${STATUS_COLORS[company!.status].text} ${STATUS_COLORS[company!.status].border}`}>
                      {STATUS_LABELS[company!.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-sans mt-0.5 flex items-center gap-1.5">
                    <span>{company?.industry}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star 
                          key={st} 
                          onClick={() => updateCompany(company!.id, { preference: st })}
                          className={`h-3 w-3 cursor-pointer ${company!.preference >= st ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFbType('incorrect_info');
                    setFbComment('');
                    setFbEmail('');
                    setShowFeedbackModal(true);
                  }}
                  className="p-2 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
                >
                  ⚠️ 情報の間違いを報告
                </button>

                <button
                  onClick={() => setCompanyToDelete(company!)}
                  className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  企業削除
                </button>
              </div>
            </div>

            {/* Sub-tab Selectors in Detail */}
            <div className="flex p-0.5 bg-gray-100 rounded-xl overflow-x-auto gap-0.5">
              {[
                { id: 'basic', label: '基本情報' },
                { id: 'es', label: 'ESメモ' },
                { id: 'interview', label: '面接メモ' },
                { id: 'notes', label: 'メモ' },
                { id: 'ob_visits', label: 'OB訪問' },
                { id: 'comparisons', label: '条件比較' }
              ].map(tb => (
                <button
                  key={tb.id}
                  onClick={() => setActiveTabState(tb.id as any)}
                  className={`flex-1 min-w-[70px] text-center py-2 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === tb.id ? `${theme.lightBg} ${theme.textDark} shadow-xs border border-${settings.themeColor}-200/50` : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-xs">
              {activeTab === 'basic' && (
                <div className="space-y-5 text-xs text-left">
                  <h3 className="text-xs font-bold text-gray-800 border-b border-gray-50 pb-2">基本情報登録・編集</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">企業名</label>
                      <input 
                        type="text" 
                        value={company?.name}
                        onChange={e => updateCompany(company!.id, { name: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">業界</label>
                      <input 
                        type="text" 
                        value={company?.industry}
                        onChange={e => updateCompany(company!.id, { industry: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    {company?.selectionType === 'intern' ? (
                      <>
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">現在の選考ステータス</label>
                          <select
                            value={company?.selectionStatusIntern || 'entry_done'}
                            onChange={e => updateCompany(company!.id, { selectionStatusIntern: e.target.value as any })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                          >
                            <option value="entry_done">エントリー済み</option>
                            <option value="es_submitted">ES提出済み</option>
                            <option value="selecting">選考中</option>
                            <option value="passed">合格</option>
                            <option value="rejected">不合格</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-600 mb-1">インターンの種別</label>
                          <select
                            value={company?.internType || '1day'}
                            onChange={e => updateCompany(company!.id, { internType: e.target.value as any })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                          >
                            <option value="1day">1day</option>
                            <option value="multi_day">複数日</option>
                            <option value="long_term">長期</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block font-bold text-gray-600 mb-1">現在の志望ステータス</label>
                          <select
                            value={company?.status}
                            onChange={e => updateCompany(company!.id, { status: e.target.value as any })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                          >
                            <option value="interested">興味あり</option>
                            <option value="es_planned">ES提出予定</option>
                            <option value="es_submitted">ES提出済み</option>
                            <option value="selecting">選考中</option>
                            <option value="offered">内定</option>
                            <option value="rejected">不合格</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-600 mb-1">選考状況ステップ</label>
                          <select
                            value={company?.selectionStage}
                            onChange={e => updateCompany(company!.id, { selectionStage: e.target.value as any })}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                          >
                            <option value="none">未設定（初期段階）</option>
                            <option value="applied">書類作成中 / 応募完了</option>
                            <option value="document_passed">書類通過</option>
                            <option value="interview_1">一次選考/面接</option>
                            <option value="interview_2">二次選考/面接</option>
                            <option value="interview_final">最終面接</option>
                            <option value="offered">内定</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">ES募集締め切り日 (カレンダー自動反映)</label>
                      <input 
                        type="date" 
                        value={company?.esDeadline || ''}
                        onChange={e => updateCompany(company!.id, { esDeadline: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">面接日時 (カレンダー自動反映)</label>
                      <input 
                        type="date" 
                        value={company?.interviewDate || ''}
                        onChange={e => updateCompany(company!.id, { interviewDate: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">本社所在地</label>
                      <input 
                        type="text" 
                        value={company?.headquarters || ''}
                        onChange={e => updateCompany(company!.id, { headquarters: e.target.value })}
                        placeholder="（例）東京都千代田区"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">企業規模</label>
                      <input 
                        type="text" 
                        value={company?.scale || ''}
                        onChange={e => updateCompany(company!.id, { scale: e.target.value })}
                        placeholder="（例）大手企業"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">設立年 / 創業年</label>
                      <input 
                        type="text" 
                        value={company?.establishedYear || ''}
                        onChange={e => updateCompany(company!.id, { establishedYear: e.target.value })}
                        placeholder="（例）1937年"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-600 mb-1">従業員数</label>
                      <input 
                        type="text" 
                        value={company?.employeeCount || ''}
                        onChange={e => updateCompany(company!.id, { employeeCount: e.target.value })}
                        placeholder="（例）約375,000人"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold text-gray-600 mb-1">採用ホームページURL（ホームページ）</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={company?.website || ''}
                          onChange={e => updateCompany(company!.id, { website: e.target.value })}
                          placeholder="https://recruit.company.co.jp"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-800"
                        />
                        {company?.website && (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`px-4 py-2.5 rounded-xl border bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 dark:hover:bg-slate-800 font-bold text-center text-xs whitespace-nowrap transition`}
                          >
                            💻 開く
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50 rounded-2xl text-[11px] text-amber-800 border border-amber-100 flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                    <div>
                      <p className="font-bold">カレンダー同期スケジュール機能</p>
                      <p className="mt-0.5 opacity-90 leading-relaxed font-sans">
                        ここで設定した締め切り日や面接日は、アプリ内の「カレンダー」タブへリアルタイムに自動反映されます。設定に応じたアプリ内アラート通知メッセージも届きます。
                      </p>
                    </div>
                  </div>

                  {/* For Intern: Transition to Main Application Section */}
                  {company?.selectionType === 'intern' && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 space-y-3 font-sans">
                      <div className="flex items-start gap-2.5">
                        <ArrowUpRight className="h-5 w-5 text-indigo-500 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-indigo-900">本選考へデータを引き継ぐ</h4>
                          <p className="text-[10px] text-indigo-700/80 mt-0.5 leading-relaxed">
                            このインターン選考の履歴（企業情報の同期、ES文章、面接メモ等）を活かして、本選考の新規エントリーを作成・同期します。
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConvertToMainModal(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Network className="h-3.5 w-3.5" />
                        本選考管理画面に引継ぎ・追加する
                      </button>
                    </div>
                  )}

                  {/* Intern Selection Steps Tracker */}
                  {company?.selectionType === 'intern' && (
                    <div className="border-t border-gray-150 pt-5 space-y-4 font-sans">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-800 text-xs font-sans">各選考ステップの日程・結果の記録</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const stepName = prompt('選考ステップ名を入力してください (例: 一次面接, グループディスカッション, インターン本番, 役員面談)');
                            if (!stepName) return;
                            const newStep = {
                              id: Date.now().toString(),
                              stepName,
                              date: new Date().toISOString().split('T')[0],
                              result: 'selection_pending' as const
                            };
                            const updatedSteps = [...(company.internSteps || []), newStep];
                            updateCompany(company.id, { internSteps: updatedSteps });
                          }}
                          className={`py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer border border-blue-150 transition`}
                        >
                          <Plus className="h-3 w-3" />
                          選考ステップを追加
                        </button>
                      </div>

                      {(!company.internSteps || company.internSteps.length === 0) ? (
                        <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl text-[10px] text-gray-400 font-sans">
                          登録された選考ステップはありません。上のボタンから追加してください。
                        </div>
                      ) : (
                        <div className="space-y-2 font-sans">
                          {company.internSteps.map(step => (
                            <div key={step.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left font-sans">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-gray-850 text-xs font-sans">{step.stepName}</span>
                                  <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold ${
                                    step.result === 'passed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 border' :
                                    step.result === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-250 border' :
                                    step.result === 'selection_pending' ? 'bg-blue-50 text-blue-700 border border-blue-200 border' :
                                    'bg-gray-100 text-gray-600 border'
                                  }`}>
                                    {step.result === 'passed' ? '合格' :
                                     step.result === 'failed' ? '不合格 / お見送り' :
                                     step.result === 'selection_pending' ? '選考中 / 結果待ち' : '未設定'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] text-gray-500 font-mono">
                                  <span>日程:</span>
                                  <input 
                                    type="date"
                                    value={step.date}
                                    onChange={e => {
                                      const updated = company.internSteps.map(s => s.id === step.id ? { ...s, date: e.target.value } : s);
                                      updateCompany(company.id, { internSteps: updated });
                                    }}
                                    className="p-1 pb-0.5 bg-white border border-gray-200 rounded-md font-mono text-[9px] h-6 text-gray-700"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={step.result}
                                  onChange={e => {
                                    const updated = company.internSteps.map(s => s.id === step.id ? { ...s, result: e.target.value as any } : s);
                                    updateCompany(company.id, { internSteps: updated });
                                  }}
                                  className="p-1 px-1.5 bg-white border border-gray-200 text-[10px] rounded-lg text-gray-700 font-sans"
                                >
                                  <option value="selection_pending">結果待ち</option>
                                  <option value="passed">合格</option>
                                  <option value="failed font-sans">不合格</option>
                                  <option value="not_set font-sans">未設定</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('この選考ステップを削除しますか？')) {
                                      const updated = company.internSteps.filter(s => s.id !== step.id);
                                      updateCompany(company.id, { internSteps: updated });
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-rose-600 transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'es' && (
                <div className="space-y-5 text-xs text-left">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2 flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800">エントリーシート回答メモ（設問別・文字数カウンター付）</h3>
                    
                    {/* --- ES COPY FROM OTHER COMPANY BUTTON ("過去のESを他の企業に流用できる") --- */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowImportES(!showImportES)}
                        className={`py-1.5 px-3 ${theme.lightBg} hover:opacity-90 border ${theme.border} ${theme.textDark} rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer`}
                      >
                        <Copy className="h-3 w-3" />
                        過去の他社ESデータを流用
                      </button>

                      {showImportES && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowImportES(false)} />
                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 overflow-hidden">
                            <span className="text-[10px] font-black text-gray-500 block mb-2 border-b border-gray-50 pb-1">流用・インポート可能な回答例一覧</span>
                            <div className="space-y-1.5 max-h-52 overflow-y-auto">
                              {companies.filter(c => c.id !== company!.id && c.esMemos.length > 0).length === 0 ? (
                                <p className="text-[9px] text-gray-400 py-2 text-center">他にES回答メモを登録している企業がありません</p>
                              ) : (
                                companies.filter(c => c.id !== company!.id && c.esMemos.length > 0).map(c => (
                                  <div key={c.id} className="space-y-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100 text-[10px]">
                                    <span className="font-bold text-gray-700 block text-[9px]">{c.name}</span>
                                    <div className="space-y-1 pl-1">
                                      {c.esMemos.map(memo => (
                                        <button
                                          key={memo.id}
                                          type="button"
                                          onClick={() => handleImportESAction(memo, c.name)}
                                          className="w-full text-left bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[9px] hover:border-indigo-400 block font-sans truncate cursor-pointer text-gray-600"
                                          title={memo.question}
                                        >
                                          {memo.question}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Registered ES Questions */}
                  <div className="space-y-4">
                    {company?.esMemos.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                        まだエントリーシート回答は保存されていません。以下の新規フォームから質問を追加・入力できます
                      </div>
                    ) : (
                      company?.esMemos.map(memo => (
                        <div key={memo.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2 relative group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-block px-2 py-0.5 text-[9px] font-black rounded-lg ${
                                memo.isDraft ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                                {memo.isDraft ? '下書き' : '完成版'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">（文字数: {memo.answer.length}字）</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateESMemo(company.id, memo.id, { isDraft: !memo.isDraft })}
                                className={`text-[10px] ${theme.text} hover:underline font-bold`}
                              >
                                {memo.isDraft ? '完成版にする' : '修正（下書き）にする'}
                              </button>
                              <button
                                onClick={() => deleteESMemo(company.id, memo.id)}
                                className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="block font-bold text-gray-500 text-[10px] font-mono">QUESTION:</span>
                            <p className="font-bold text-gray-900 mt-0.5 leading-relaxed bg-white border border-gray-100 p-2.5 rounded-xl break-words">{memo.question}</p>
                          </div>

                          <div>
                            <span className="block font-bold text-gray-500 text-[10px] font-mono">ANSWER:</span>
                            <div className="whitespace-pre-wrap text-gray-700 mt-1 leading-relaxed bg-white border border-gray-100 p-3.5 rounded-xl text-[11px] font-sans break-words">
                              {memo.answer}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form to insert ES question answering */}
                  <form onSubmit={handleCreateESMemo} className={`border-t pt-4 space-y-3 p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-50/30 border-gray-100'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs block ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>新規設問・回答メモの追加</span>
                      <button
                        type="button"
                        onClick={() => setShowImportSelfAnalysis(!showImportSelfAnalysis)}
                        className={`text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-slate-100' 
                            : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        自己分析から引用
                      </button>
                    </div>

                    {showImportSelfAnalysis && (
                      <div className={`p-4 rounded-2xl border space-y-3 shadow-2xs text-left transition-all ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-amber-50/30 border-amber-100 text-amber-900'
                      }`}>
                        <div className="flex items-center justify-between border-b pb-1.5 border-dashed border-gray-200 dark:border-slate-800">
                          <span className={`text-[10.5px] font-bold ${isDark ? 'text-slate-300' : 'text-amber-800'}`}>
                            自己分析データから引用する
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowImportSelfAnalysis(false)}
                            className="text-gray-400 hover:text-gray-650 cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-3 text-xs max-h-60 overflow-y-auto pr-1">
                          {/* 1. 自己PR */}
                          {selfAnalysis.selfPR && (
                            <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500">自己PR</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewQuestion('自己PRについて詳しく教えてください（400文字目安）');
                                    setNewAnswer(getDisplayRepresentation(selfAnalysis.selfPR));
                                    setShowImportSelfAnalysis(false);
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white transition-all hover:opacity-90 cursor-pointer ${theme.bg}`}
                                >
                                  引用する
                                </button>
                              </div>
                              <p className="text-[10.5px] text-gray-400 line-clamp-3 leading-relaxed">{getDisplayRepresentation(selfAnalysis.selfPR)}</p>
                            </div>
                          )}

                          {/* 2. ガクチカ */}
                          {selfAnalysis.gakuchika && (
                            <div className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500">学生時代に最も力を入れたこと（ガクチカ）</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewQuestion('学生時代に最も力を入れたこと（ガクチカ）を教えてください。');
                                    setNewAnswer(getDisplayRepresentation(selfAnalysis.gakuchika));
                                    setShowImportSelfAnalysis(false);
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white transition-all hover:opacity-90 cursor-pointer ${theme.bg}`}
                                >
                                  引用する
                                </button>
                              </div>
                              <p className="text-[10.5px] text-gray-400 line-clamp-3 leading-relaxed">{getDisplayRepresentation(selfAnalysis.gakuchika)}</p>
                            </div>
                          )}

                          {/* 3. 志望動機ベース */}
                          {selfAnalysis.baseMotivations?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-gray-400">志望動機ベース</span>
                              {selfAnalysis.baseMotivations.map(bm => (
                                <div key={bm.id} className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{bm.industry} / {bm.occupation || '企画職'}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewQuestion(`貴社の ${bm.industry} 職における志望動機を教えてください。`);
                                        setNewAnswer(bm.content);
                                        setShowImportSelfAnalysis(false);
                                      }}
                                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white transition-all hover:opacity-90 cursor-pointer ${theme.bg}`}
                                    >
                                      引用する
                                    </button>
                                  </div>
                                  <p className="text-[10.5px] text-gray-400 line-clamp-3 leading-relaxed">{bm.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 4. 面接想定質問 FAQ */}
                          {selfAnalysis.faqs?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="block text-[10px] font-bold text-gray-400">面接想定FAQ</span>
                              {selfAnalysis.faqs.map(faq => (
                                <div key={faq.id} className={`p-2.5 rounded-xl border flex flex-col gap-1.5 ${
                                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-150'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{faq.question}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewQuestion(faq.question);
                                        setNewAnswer(faq.answer);
                                        setShowImportSelfAnalysis(false);
                                      }}
                                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold text-white transition-all hover:opacity-90 cursor-pointer ${theme.bg}`}
                                    >
                                      引用する
                                    </button>
                                  </div>
                                  <p className="text-[10.5px] text-gray-400 line-clamp-3 leading-relaxed">{faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {(!selfAnalysis.selfPR && !selfAnalysis.gakuchika && (!selfAnalysis.baseMotivations || selfAnalysis.baseMotivations.length === 0) && (!selfAnalysis.faqs || selfAnalysis.faqs.length === 0)) && (
                            <p className="text-center text-[10px] text-gray-450 py-3">自己分析データが登録されていません。「自己分析」タブから設定してください。</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className={`block font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>設問（設問内容、指定文字数目安等）</label>
                      <input
                        type="text"
                        required
                        placeholder="例: 学生時代に最も注力したイベントと自身の役割について教えてください。（400文字以内）"
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border focus:outline-hidden transition-all ${
                          isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-gray-600 font-bold">回答・自己PR構文</label>
                        <span className="text-[10px] text-gray-400 font-bold font-mono">入力文字数: {newAnswer.length} 字</span>
                      </div>
                      <textarea
                        required
                        rows={4}
                        placeholder="フレームワーク（結論→課題→行動→結果→会社での活躍）を意識して、具体的に入力してください。"
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-50 pt-2 flex-wrap gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-600">
                        <input
                          type="checkbox"
                          checked={newIsDraft}
                          onChange={e => setNewIsDraft(e.target.checked)}
                          className={`rounded-sm text-${settings.themeColor}-600 ${theme.accent}`}
                        />
                        下書きに設定する（後から完成版にトグルできます）
                      </label>

                      <button
                        type="submit"
                        disabled={!newQuestion.trim() || !newAnswer.trim()}
                        className={`py-1.5 px-4 text-white font-bold rounded-lg ${theme.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        設問と回答を保存
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'interview' && (
                <div className="space-y-5 text-xs text-left">
                  <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">面接ログ・振り返りメモ（一次～最終／形式選定可能）</h3>

                  {/* Registered interview logs */}
                  <div className="space-y-5">
                    {company?.interviewMemos.length === 0 ? (
                      <div className="py-6 text-center text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                        まだ登録された面接メモはありません。以下のフォームから面接当日のログを記録しましょう
                      </div>
                    ) : (
                      company?.interviewMemos.map(memo => (
                        <div key={memo.id} className="border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden shadow-xs">
                          {/* log header */}
                          <div className="p-3 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-950 font-sans">{memo.stageName}</span>
                              <span className={`inline-block text-[9px] ${theme.lightBg} border ${theme.border} rounded px-1.5 ${theme.textDark}`}>
                                {memo.format === 'individual' ? '個人面接' : memo.format === 'group' ? '集団面接' : 'その他'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500 bg-white border px-2 py-0.5 rounded-md">{memo.date}</span>
                              <button
                                onClick={() => deleteInterviewMemo(company.id, memo.id)}
                                className="text-gray-300 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="p-3.5 space-y-3 bg-white text-xs">
                            {memo.questionsAndAnswers.map((qa, i) => (
                              <div key={i} className="space-y-1.5 p-2.5 bg-gray-50/50 rounded-xl">
                                <div className="font-bold flex items-start gap-1 pr-1 text-gray-900 break-words">
                                  <span className="text-rose-500">❓</span>
                                  <span className="break-words">質問: {qa.q}</span>
                                </div>
                                <div className="text-gray-700 font-medium pl-6 leading-relaxed break-words">
                                  回答: {qa.a}
                                </div>
                              </div>
                            ))}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                              {memo.reflections && (
                                <div className="bg-blue-50/30 border border-blue-100 p-2.5 rounded-xl">
                                  <span className="block font-black text-blue-800 text-[10px] mb-1">💡 振り返り・手応え</span>
                                  <p className="text-gray-700 leading-relaxed font-sans break-words">{memo.reflections}</p>
                                </div>
                              )}
                              {memo.improvements && (
                                <div className="bg-amber-50/30 border border-amber-100 p-2.5 rounded-xl">
                                  <span className="block font-black text-amber-800 text-[10px] mb-1">⚠️ 改善・反省点</span>
                                  <p className="text-gray-700 leading-relaxed font-sans break-words">{memo.improvements}</p>
                                </div>
                              )}
                              {memo.nextPrep && (
                                <div className="bg-green-50/30 border border-green-100 p-2.5 rounded-xl">
                                  <span className="block font-black text-emerald-800 text-[10px] mb-1">🎯 次回への準備</span>
                                  <p className="text-gray-700 leading-relaxed font-sans break-words">{memo.nextPrep}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form to insert interview logs */}
                  <form onSubmit={handleCreateInterviewMemo} className="border-t border-gray-50 pt-4 space-y-3 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                    <span className="font-bold text-gray-800 text-xs block">面接振り返りメモの新規追加</span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">面接日</label>
                        <input
                          type="date"
                          value={newIntDate}
                          onChange={e => setNewIntDate(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">選考フェーズ例</label>
                        <input
                          type="text"
                          required
                          value={newIntStage}
                          onChange={e => setNewIntStage(e.target.value)}
                          placeholder="例: 一次面接 / 最終面接"
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">面接形式</label>
                        <select
                          value={newIntFormat}
                          onChange={e => setNewIntFormat(e.target.value as any)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-0"
                        >
                          <option value="individual">個人面接 (1対1等)</option>
                          <option value="group">集団面接 / GD</option>
                          <option value="other">その他面話/説明等</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">質問された内容（1項目）</label>
                        <input
                          type="text"
                          required
                          placeholder="例: 「なぜITコンサルを選んだのか、開発エンジニアとの違いをどう捉えるか？」"
                          value={newIntQ}
                          onChange={e => setNewIntQ(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">自身の回答・反応</label>
                        <input
                          type="text"
                          required
                          placeholder="例: 理由を述べつつ、最終的にDX価値を提供する現場への寄り添いができる点に触れた。"
                          value={newIntA}
                          onChange={e => setNewIntA(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">振り返り・手応え</label>
                        <textarea
                          placeholder="反応が良かった点、表情や受け答えの出来等"
                          value={newIntReflections}
                          onChange={e => setNewIntReflections(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-1">反省・改善点</label>
                        <textarea
                          placeholder="言葉に詰まった、早口になったなど次回直すこと"
                          value={newIntImprovements}
                          onChange={e => setNewIntImprovements(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-1">次回に向けた準備メモ</label>
                        <textarea
                          placeholder="他社との強みの違いについて調べてみる、企業研究を深めるなど"
                          value={newIntNextPrep}
                          onChange={e => setNewIntNextPrep(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={!newIntStage.trim() || !newIntQ.trim() || !newIntA.trim()}
                        className={`py-1.5 px-4 text-white font-bold rounded-lg ${theme.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        面接メモを保存
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs text-left">
                  <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">自由記述メモ欄</h3>
                  
                  <textarea
                    rows={8}
                    className={`w-full p-4 bg-gray-50/50 hover:bg-white border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 text-xs leading-relaxed`}
                    placeholder="企業研究のメモ、説明会での発見、志望度の変化理由、OBの話した内容のメモなど、自由に入力してください。"
                    value={company?.notes || ''}
                    onChange={e => updateCompany(company!.id, { notes: e.target.value })}
                  />

                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>このテキストエリアは、入力・編集が行われると自動的に保存されます。</span>
                  </div>
                </div>
              )}

              {/* OB VISITS TAB: Future extension capability already fully functional! */}
              {activeTab === 'ob_visits' && (
                <div className="space-y-5 text-xs text-left">
                  <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">OB訪問・社員交流メモ一覧</h3>

                  <div className="space-y-3">
                    {obVisits.filter(v => v.companyId === company!.id).length === 0 ? (
                      <div className="py-6 text-center text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                        まだ登録されたOB訪問記録はありません。以下のフォームから社員さんのアドバイスを記録しておきましょう
                      </div>
                    ) : (
                      obVisits.filter(v => v.companyId === company!.id).map(visit => (
                        <div key={visit.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 relative">
                          <button
                            onClick={() => deleteObVisit(visit.id)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          
                          <div className="flex items-center gap-2">
                            <UserCheck className={`h-4.5 w-4.5 ${theme.text}`} />
                            <span className="font-bold text-gray-900">{visit.alumniName} 様</span>
                            <span className="text-[10px] text-gray-400 font-mono">({visit.visitDate})</span>
                          </div>

                          <div className="text-[10px] text-gray-500 font-sans font-bold break-words">
                            所属部署: {visit.department}
                          </div>

                          <p className="text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100 leading-relaxed font-sans break-words">
                            {visit.notes}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form OB Visit */}
                  <form onSubmit={handleCreateObVisit} className="border-t border-gray-50 pt-4 space-y-3 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                    <span className="font-bold text-gray-800 text-xs block">OB・OG社員訪問の新規追加</span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">社員名</label>
                        <input
                          type="text"
                          required
                          placeholder="例: 佐藤 健一"
                          value={newObName}
                          onChange={e => setNewObName(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">所属部署（入社年次等）</label>
                        <input
                          type="text"
                          required
                          placeholder="例: ソリューション営業部 (2018年入社)"
                          value={newObDept}
                          onChange={e => setNewObDept(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">訪問・相談日</label>
                        <input
                          type="date"
                          value={newObDate}
                          onChange={e => setNewObDate(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-600 font-bold mb-1">伺った話・選考に向けたアドバイスなど</label>
                      <textarea
                        placeholder="就活のアドバイスや、会社の真の実態、求める人物像のアドバイスなどを記述してください。"
                        value={newObNotes}
                        onChange={e => setNewObNotes(e.target.value)}
                        rows={3}
                        required
                        className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={!newObName.trim() || !newObDept.trim() || !newObNotes.trim()}
                        className={`py-1.5 px-4 text-white font-bold rounded-lg ${theme.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        訪問記録を保存
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* OFFERS COMPARISONS TAB: Fully functional comparison tool! */}
              {activeTab === 'comparisons' && (
                <div className="space-y-5 text-xs text-left">
                  <h3 className="font-bold text-gray-800 border-b border-gray-50 pb-2">内定・求人条件の比較メモ（待遇・働きやすさ）</h3>

                  <div className="space-y-4">
                    {offerComparisons.filter(c => c.companyId === company!.id).length === 0 ? (
                      <div className="py-6 text-center text-gray-400 border border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                        この企業の待遇条件比較メモはありません。以下のフォームから賃金・メリットなどを保存しましょう
                      </div>
                    ) : (
                      offerComparisons.filter(c => c.companyId === company!.id).map(comp => (
                        <div key={comp.id} className="border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden relative shadow-xs">
                          <button
                            onClick={() => deleteOfferComparison(comp.id)}
                            className="absolute top-2.5 right-2 px-1.5 py-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer text-xs z-10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <div className="p-3.5 bg-gray-50 flex items-center gap-2">
                            <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                            <span className="font-black text-xs text-gray-950">求人待遇マトリクス (志望ランキング: 第 {comp.rank} 位)</span>
                          </div>

                          <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                              <div>
                                <span className="text-gray-400 block font-bold">配属予定職種:</span>
                                <span className="font-bold text-gray-900 break-words">{comp.role || '未定（一般職）'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-bold">基本給 (月額基準):</span>
                                <span className="font-mono font-bold text-emerald-600 text-sm">¥ {comp.baseSalary.toLocaleString() || '未設定'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-bold">通勤・通勤時間形態:</span>
                                <span className="text-gray-700 break-words">{comp.commuteTime || '通常通勤'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block font-bold">諸手当・福利厚生:</span>
                                <p className="text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 font-sans break-words">{comp.benefits || 'なし'}</p>
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              <div className="p-2.5 bg-green-50/40 rounded-xl border border-green-100">
                                <span className="text-emerald-800 font-bold block text-[10px] mb-0.5">👍 魅力・メリット（Pros）</span>
                                <p className="text-gray-700 font-sans leading-relaxed break-words">{comp.pros || '特になし'}</p>
                              </div>
                              <div className="p-2.5 bg-rose-50/40 rounded-xl border border-rose-100">
                                <span className="text-rose-800 font-bold block text-[10px] mb-0.5">👎 懸念点・デメリット（Cons）</span>
                                <p className="text-gray-700 font-sans leading-relaxed break-words">{comp.cons || '特になし'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form register Condition Compare */}
                  <form onSubmit={handleCreateComparison} className="border-t border-gray-50 pt-4 space-y-3 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                    <span className="font-bold text-gray-800 text-xs block">内定・採用求人待遇の追加</span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">基本給(月額・万)</label>
                        <input
                          type="number"
                          required
                          value={newCompSalary}
                          onChange={e => setNewCompSalary(Number(e.target.value))}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">予定職種</label>
                        <input
                          type="text"
                          required
                          placeholder="例: ITエンジニア・総合職"
                          value={newCompRole}
                          onChange={e => setNewCompRole(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">通勤時間・リモート有無</label>
                        <input
                          type="text"
                          required
                          placeholder="例: 約30分 (週2在宅可等)"
                          value={newCompCommute}
                          onChange={e => setNewCompCommute(e.target.value)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">志望順位(1~5位)</label>
                        <select
                          value={newCompRank}
                          onChange={e => setNewCompRank(Number(e.target.value) as any)}
                          className="w-full p-2 bg-white border border-gray-200 rounded-xl focus:ring-0"
                        >
                          <option value={1}>第1位</option>
                          <option value={2}>第2位</option>
                          <option value={3}>第3位</option>
                          <option value={4}>第4位</option>
                          <option value={5}>第5位</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-600 font-bold mb-0.5">福利厚生・手当（家賃補助等）</label>
                      <input
                        type="text"
                        placeholder="例: 住宅手当3万、慶弔見舞金、残業代別途支給等"
                        value={newCompBenefits}
                        onChange={e => setNewCompBenefits(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">長所・魅力</label>
                        <textarea
                          placeholder="家から近い、成長スピード、やりたい職種等"
                          value={newCompPros}
                          onChange={e => setNewCompPros(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-gray-250 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-0.5">短所・懸念点</label>
                        <textarea
                          placeholder="残業が多い傾向、転勤リスク等"
                          value={newCompCons}
                          onChange={e => setNewCompCons(e.target.value)}
                          rows={2}
                          className="w-full p-2 bg-white border border-gray-250 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={!newCompRole.trim() || !newCompCommute.trim() || !newCompSalary || Number(newCompSalary) <= 0}
                        className={`py-1.5 px-4 text-white font-bold rounded-lg ${theme.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        待遇メモを保存
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DAYS REMAINING CALCULATION ACCORDING TO USER REQUIREMENTS --- */}
      {(() => {
        const getDaysRemaining = (deletedAt: string) => {
          try {
            const deletedDate = new Date(deletedAt).getTime();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            const expiryDate = deletedDate + thirtyDaysMs;
            const remainingMs = expiryDate - Date.now();
            const days = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
            return days > 0 ? days : 0;
          } catch (_) {
            return 30;
          }
        };

        return (
          <>
            {/* Custom Confirm Modal for Soft Deletion */}
            {companyToDelete && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setCompanyToDelete(null)} />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={`rounded-3xl p-6 w-full max-w-sm shadow-2xl relative border z-50 space-y-4 text-left ${
                    isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-gray-900 border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-rose-600 flex items-center gap-1.5 font-sans">
                      <Trash2 className="h-4 w-4" />
                      本当に削除しますか？
                    </h3>
                    <button 
                      onClick={() => setCompanyToDelete(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold leading-relaxed">
                      「{companyToDelete.name}」を一時削除してゴミ箱に移動します。
                    </p>
                    <p className="text-gray-500 font-sans leading-relaxed">
                      ゴミ箱に移動したデータは30日間保存され、その間はいつでも完全に復元できます。30日を過ぎると自動的に完全消去されます。
                    </p>
                    <p className="text-[10px] text-gray-400 font-sans leading-normal">
                      ※ 企業に紐づくエントリーシート（ES）回答メモ、面接質問メモ、OB訪問履歴、条件比較データなども一時的に非表示になり、ゴミ箱から戻した際は一緒に復元されます。
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCompanyToDelete(null)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans cursor-pointer transition border text-center ${
                        isDark ? 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-750' : 'bg-gray-100 hover:bg-gray-150 text-gray-700 border-transparent'
                      }`}
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCompany(companyToDelete.id);
                        setCompanyToDelete(null);
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition text-center"
                    >
                      削除（ゴミ箱へ）
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Trash Bin Modal Form */}
            {showTrashModal && (
              <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
                <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setShowTrashModal(false)} />
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className={`rounded-3xl p-6 w-full max-w-lg shadow-2xl relative border z-50 space-y-4 text-left flex flex-col max-h-[80vh] ${
                    isDark ? 'bg-slate-900 text-slate-100 border-slate-800' : 'bg-white text-gray-900 border-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-start border-b border-gray-100/60 dark:border-slate-850 pb-3 flex-shrink-0">
                    <div>
                      <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5 font-sans">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                        ゴミ箱（削除済み企業一覧）
                      </h3>
                      <p className="text-[10px] text-gray-400 font-sans mt-0.5 animate-fade-in">
                        削除された企業データは、30日後の保管期間内であれば、いつでも元の状態に復元可能です。
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowTrashModal(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2.5 py-1 flex-1 pr-1 font-sans">
                    {trashCompanies.length === 0 ? (
                      <div className="py-12 text-center text-xs space-y-1.5 text-gray-450 border border-dashed border-gray-250 dark:border-slate-800 rounded-2xl">
                        <p className="font-bold">ゴミ箱は空です</p>
                        <p className="text-[10px] text-gray-400">削除された企業はありません</p>
                      </div>
                    ) : (
                      trashCompanies.map(co => {
                        const daysLeft = getDaysRemaining(co.deletedAt);
                        return (
                          <div 
                            key={co.id} 
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-left ${
                              isDark ? 'bg-slate-950/45 border-slate-850' : 'bg-gray-50/50 border-gray-150'
                            }`}
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-gray-850 dark:text-gray-155 truncate">{co.name}</h4>
                                <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold ${
                                  daysLeft <= 7 
                                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-955/20 dark:text-rose-400 border border-rose-150' 
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450 border border-amber-200'
                                }`}>
                                  自動消去まで あと {daysLeft} 日
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1.5 truncate">
                                <span>{co.industry}</span>
                                <span>•</span>
                                <span>削除: {new Date(co.deletedAt).toLocaleDateString()}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0 font-sans">
                              <button
                                onClick={() => restoreCompany(co.id)}
                                className={`py-1 px-2 rounded-lg text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer transition-all border ${
                                  isDark 
                                    ? 'bg-indigo-950/40 text-indigo-300 border-indigo-900/50 hover:bg-indigo-900/80 hover:text-indigo-100' 
                                    : 'bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                                }`}
                              >
                                <RotateCcw className="h-3 w-3" />
                                復元
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('この企業データを完全に削除してもよろしいですか？この操作は取り消せません。')) {
                                    permanentlyDeleteCompany(co.id);
                                  }
                                }}
                                className="p-1 px-1.5 text-gray-400 hover:text-rose-600 dark:hover:bg-rose-955/20 hover:bg-rose-50 rounded-lg transition"
                                title="永久に削除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-100/50 dark:border-slate-850 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowTrashModal(false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
                        isDark ? 'bg-slate-850 hover:bg-slate-800 text-slate-300' : 'bg-gray-100 hover:bg-gray-150 text-gray-700'
                      }`}
                    >
                      閉じる
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
