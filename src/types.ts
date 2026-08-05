/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CompanyStatus = 
  | 'interested'     // 興味あり
  | 'es_planned'     // ES提出予定
  | 'es_submitted'   // ES提出済み
  | 'selecting'      // 選考中
  | 'offered'        // 内定
  | 'rejected';      // 不合格

export type SelectionStage =
  | 'applied'           // 応募
  | 'document_passed'   // 書類通過
  | 'interview_1'       // 一次面接
  | 'interview_2'       // 二次面接
  | 'interview_final'   // 最終面接
  | 'offered'           // 内定
  | 'none';

export type ESCategory = 'self_pr' | 'gakuchika' | 'motivation' | 'other';
export type ESStatus = 'not_started' | 'drafting' | 'completed';

export interface ESQuestionMemo {
  id: string;
  question: string;
  answer: string;
  isDraft: boolean; // TRUE: 下書き, FALSE: 完成版 (for back-compat)
  category?: ESCategory;
  minChars?: number;
  maxChars?: number;
  status?: ESStatus;
}

export interface InterviewMemo {
  id: string;
  date: string;
  stageName: string; // 一次, 二次, 最終, etc.
  format: 'individual' | 'group' | 'other'; // 個人, 集団, その他
  questionsAndAnswers: { q: string; a: string }[];
  reflections: string;    // 振り返り
  improvements: string;   // 改善点
  nextPrep: string;       // 次回準備メモ
}

export type InternStatus =
  | 'entry_done'     // エントリー済み
  | 'es_submitted'   // ES提出済み
  | 'selecting'      // 選考中
  | 'passed'         // 合格
  | 'rejected';      // 不合格

export type InternType = '1day' | 'multi_day' | 'long_term';

export interface InternStep {
  id: string;
  stepName: string; // e.g. "書類選考", "1次選考"
  date: string; // YYYY-MM-DD
  result: 'selecting' | 'passed' | 'rejected' | 'none';
  notes: string;
}

export interface CompanyResearch {
  businessModel: string;   // 事業内容・ビジネスモデル
  customer: string;        // 3C分析: 顧客・ターゲット市場
  competitor: string;      // 3C分析: 競合他社との違い
  strength: string;        // 3C分析: 自社の強み
  weakness: string;        // 懸念点・弱み
  cultureNotes: string;    // 社風・カルチャー
  motivationHints: string; // 志望動機のヒント
  lastUpdated?: string;
}

export interface IndustryCompanyNote {
  id: string;
  companyName: string; // ブレスト段階の企業名（企業一覧への正式登録は任意）
  memo: string;        // 自由記述の一言メモ
}

export interface IndustryResearch {
  id: string;
  industryName: string;    // 業界名（プリセット選択 or 自由入力）
  marketSize: string;      // 市場規模
  growthTrend: string;     // 成長性・トレンド
  majorCompanies: string;  // 主要企業
  characteristics: string; // 業界の特徴・仕事内容
  challenges: string;      // 業界が抱える課題
  interestReason: string;  // なぜこの業界に興味を持ったか
  notes: IndustryCompanyNote[]; // 業界内で自由に書き留める気になる企業メモ
  lastUpdated?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  preference: number; // 1-5
  status: CompanyStatus; // Standard main status
  selectionStatusIntern?: InternStatus; // Separated Intern Status
  selectionStage: SelectionStage;
  esDeadline: string; // YYYY-MM-DD
  interviewDate: string; // YYYY-MM-DD
  esMemos: ESQuestionMemo[];
  interviewMemos: InterviewMemo[];
  notes: string;
  headquarters?: string;
  scale?: string;
  website?: string;
  establishedYear?: string;
  employeeCount?: string;
  isForeign?: boolean;
  lastUpdated?: string;
  category?: string;
  
  // Selection Type split fields
  selectionType?: 'main' | 'intern'; // 'main' = 本選考, 'intern' = インターン選考
  internType?: InternType; // 1day, 複数日, 長期
  internSteps?: InternStep[];

  research?: CompanyResearch; // 企業研究シート（業界・企業研究タブで編集）
}

export type TodoScope = 'today' | 'weekly' | 'monthly' | 'goal';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  scope: TodoScope;
  dueDate?: string; // YYYY-MM-DD
  subtasks?: SubTask[]; // 目標用のサブタスク
}

export interface BaseMotivation {
  id: string;
  industry: string;
  occupation: string;
  content: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SelfAnalysis {
  selfPR: string;
  gakuchika: string;
  baseMotivations: BaseMotivation[];
  faqs: FAQItem[];
}

export interface AppSettings {
  themeColor: string; // Hex color code or Tailwind key
  notificationsEnabled: boolean;
  notificationDaysBefore: number; // 何日前に通知するか
  notificationTime: string; // "09:00" etc.
  themeMode: 'light' | 'dark' | 'system';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'es_deadline' | 'interview' | 'todo';
  targetCompanyId?: string;
  targetTodoId?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // Time text or relative
  read: boolean;
}

export interface ObVisit {
  id: string;
  companyId: string;
  visitDate: string;
  alumniName: string;
  department: string;
  notes: string;
}

export interface OfferComparison {
  id: string;
  companyId: string;
  baseSalary: number; // e.g. 250000
  benefits: string;
  role: string;
  commuteTime: string;
  pros: string;
  cons: string;
  rank: number; // preference ranking (1, 2, 3)
}
