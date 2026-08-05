/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { IndustryResearch, CompanyResearch, Company } from '../types';
import {
  Compass,
  Factory,
  Building2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Users,
  Swords,
  Sparkles,
  AlertTriangle,
  Heart,
  Target,
  ArrowUpRight,
  X,
  StickyNote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 就活でよく使われる業界カテゴリのプリセット。ここに無い業界は「その他（自由入力）」で追加できる。
const INDUSTRY_OPTIONS = [
  'IT・インターネット',
  'メーカー（電機・自動車・素材）',
  '商社',
  '金融（銀行・証券・保険）',
  'コンサルティング',
  '広告・マスコミ・出版',
  '小売・流通',
  '人材サービス',
  '不動産・建設',
  '医療・福祉・製薬',
  '官公庁・公社・団体',
  '運輸・物流・インフラ',
  '教育',
  'エンターテインメント・レジャー',
  '飲食・宿泊'
];

const EMPTY_COMPANY_RESEARCH: CompanyResearch = {
  businessModel: '',
  customer: '',
  competitor: '',
  strength: '',
  weakness: '',
  cultureNotes: '',
  motivationHints: ''
};

const INDUSTRY_FIELDS: { fieldKey: keyof Omit<IndustryResearch, 'id' | 'notes' | 'lastUpdated'>; icon: React.ElementType; label: string; placeholder: string }[] = [
  { fieldKey: 'marketSize', icon: TrendingUp, label: '市場規模', placeholder: '例: 国内市場規模 約5兆円、拡大傾向' },
  { fieldKey: 'growthTrend', icon: Sparkles, label: '成長性・トレンド', placeholder: '例: DX需要で年10%成長、生成AI領域が急伸' },
  { fieldKey: 'majorCompanies', icon: Building2, label: '主要企業', placeholder: '例: A社、B社、C社（外資含む）' },
  { fieldKey: 'characteristics', icon: Compass, label: '業界の特徴・仕事内容', placeholder: '例: プロジェクト単位のチーム制、クライアントワーク中心' },
  { fieldKey: 'challenges', icon: AlertTriangle, label: '業界が抱える課題', placeholder: '例: 人材不足、価格競争の激化' },
  { fieldKey: 'interestReason', icon: Heart, label: 'なぜこの業界に興味を持ったか', placeholder: '例: 自身の〇〇の経験から、この業界の△△に課題意識を持った' }
];

const COMPANY_FIELDS: { fieldKey: keyof CompanyResearch; icon: React.ElementType; label: string; placeholder: string }[] = [
  { fieldKey: 'businessModel', icon: Building2, label: '事業内容・ビジネスモデル', placeholder: '例: 法人向けSaaSを開発・提供し、月額課金で収益を得ている' },
  { fieldKey: 'customer', icon: Users, label: '顧客・ターゲット市場（3C: Customer）', placeholder: '例: 中堅・大手企業の情報システム部門' },
  { fieldKey: 'competitor', icon: Swords, label: '競合と差別化ポイント（3C: Competitor）', placeholder: '例: 競合A社と比べて導入コストが低く中小企業に強い' },
  { fieldKey: 'strength', icon: Sparkles, label: '自社の強み（3C: Company）', placeholder: '例: 業界特化型のノウハウと手厚いサポート体制' },
  { fieldKey: 'weakness', icon: AlertTriangle, label: '懸念点・弱み', placeholder: '例: 海外展開はこれから、知名度がまだ低い' },
  { fieldKey: 'cultureNotes', icon: Heart, label: '社風・カルチャー', placeholder: '例: 若手にも裁量権がある、風通しの良い社風' },
  { fieldKey: 'motivationHints', icon: Target, label: '志望動機のヒント', placeholder: '例: 自分の〇〇という経験と、この会社の△△という強みが重なる' }
];

function normalizeForMatch(s: string): string {
  return (s || '').toLowerCase().replace(/[・\s（）()]/g, '');
}

function AutoSaveField({
  icon: Icon,
  label,
  value,
  onCommit,
  placeholder,
  isDark
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <div>
      <label className={`flex items-center gap-1.5 text-micro font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        <Icon className="h-3 w-3" />
        {label}
      </label>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== value) onCommit(draft);
        }}
        placeholder={placeholder}
        rows={2}
        className={`w-full px-3 py-2 text-body-sm rounded-xl border resize-none focus:outline-hidden transition-colors ${
          isDark
            ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600'
            : 'bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-350'
        }`}
      />
    </div>
  );
}

function CompanyResearchRow({ company, isDark }: { company: Company; isDark: boolean }) {
  const { updateCompanyResearch } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-150'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className={`h-3.5 w-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          <span className="text-body-sm font-bold truncate">{company.name}</span>
        </div>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-3 space-y-3 overflow-hidden"
          >
            {COMPANY_FIELDS.map(f => (
              <div key={f.fieldKey}>
                <AutoSaveField
                  icon={f.icon}
                  label={f.label}
                  value={(company.research?.[f.fieldKey] as string) || ''}
                  onCommit={v => updateCompanyResearch(company.id, { ...EMPTY_COMPANY_RESEARCH, ...company.research, [f.fieldKey]: v })}
                  placeholder={f.placeholder}
                  isDark={isDark}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IndustryCard({ industry, isDark }: { industry: IndustryResearch; isDark: boolean }) {
  const { companies, updateIndustryResearch, deleteIndustryResearch, addCompanyNoteToIndustry, deleteCompanyNoteFromIndustry, promoteCompanyNote } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [noteName, setNoteName] = useState('');
  const [noteMemo, setNoteMemo] = useState('');

  const matchedCompanies = companies.filter(c => {
    const ci = normalizeForMatch(c.industry);
    const ind = normalizeForMatch(industry.industryName);
    return ci && ind && (ci.includes(ind) || ind.includes(ci));
  });

  const addNote = () => {
    if (!noteName.trim()) return;
    addCompanyNoteToIndustry(industry.id, { companyName: noteName.trim(), memo: noteMemo.trim() });
    setNoteName('');
    setNoteMemo('');
  };

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Factory className={`h-4 w-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
          <div className="min-w-0">
            <div className="text-subhead font-bold truncate">{industry.industryName}</div>
            <div className={`text-micro flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              {matchedCompanies.length > 0 && <span>登録済み {matchedCompanies.length}社</span>}
              {industry.notes.length > 0 && <span>メモ {industry.notes.length}件</span>}
            </div>
          </div>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 opacity-50" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-4 pb-4 space-y-4 border-t overflow-hidden ${isDark ? 'border-slate-800' : 'border-gray-100'}`}
          >
            {/* 業界そのものの研究シート */}
            <div className="pt-3 space-y-3">
              {INDUSTRY_FIELDS.map(f => (
                <div key={f.fieldKey}>
                  <AutoSaveField
                    icon={f.icon}
                    label={f.label}
                    value={industry[f.fieldKey]}
                    onCommit={v => updateIndustryResearch(industry.id, { [f.fieldKey]: v })}
                    placeholder={f.placeholder}
                    isDark={isDark}
                  />
                </div>
              ))}
            </div>

            {/* 企業一覧に登録済みの企業（自動グルーピング） */}
            {matchedCompanies.length > 0 && (
              <div>
                <div className={`text-micro font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <Building2 className="h-3 w-3" />
                  登録済み企業（企業一覧と連動）
                </div>
                <div className="space-y-1.5">
                  {matchedCompanies.map(c => (
                    <div key={c.id}>
                      <CompanyResearchRow company={c} isDark={isDark} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ブレスト用の気になる企業メモ */}
            <div>
              <div className={`text-micro font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                <StickyNote className="h-3 w-3" />
                気になる企業メモ（自由記述）
              </div>
              <div className="space-y-1.5">
                {industry.notes.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-2 p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-amber-50/40 border-amber-100'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-bold truncate">{n.companyName}</div>
                      {n.memo && <div className={`text-micro mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{n.memo}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={() => promoteCompanyNote(industry.id, n.id)}
                      title="企業一覧に登録する"
                      className="shrink-0 p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 cursor-pointer"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCompanyNoteFromIndustry(industry.id, n.id)}
                      className={`shrink-0 p-1.5 rounded-lg cursor-pointer ${isDark ? 'text-slate-500 hover:bg-slate-800' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 mt-2">
                <input
                  value={noteName}
                  onChange={e => setNoteName(e.target.value)}
                  placeholder="気になる企業名"
                  className={`flex-1 px-3 py-2 text-body-sm rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-gray-50 border-gray-200 placeholder:text-gray-350'
                  }`}
                />
                <input
                  value={noteMemo}
                  onChange={e => setNoteMemo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  placeholder="一言メモ（任意）"
                  className={`flex-1 px-3 py-2 text-body-sm rounded-xl border focus:outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-gray-50 border-gray-200 placeholder:text-gray-350'
                  }`}
                />
                <button
                  type="button"
                  onClick={addNote}
                  disabled={!noteName.trim()}
                  className="px-3 py-2 rounded-xl bg-amber-500 text-amber-950 text-body-sm font-bold flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  追加
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => deleteIndustryResearch(industry.id)}
              className="w-full py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 text-body-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              この業界研究を削除
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddIndustryForm({ existingNames, isDark }: { existingNames: string[]; isDark: boolean }) {
  const { addIndustryResearch } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [selected, setSelected] = useState('');
  const [customName, setCustomName] = useState('');

  const availableOptions = INDUSTRY_OPTIONS.filter(o => !existingNames.includes(o));
  const isCustom = selected === '__custom__';
  const finalName = isCustom ? customName.trim() : selected;

  const submit = () => {
    if (!finalName) return;
    addIndustryResearch({
      industryName: finalName,
      marketSize: '',
      growthTrend: '',
      majorCompanies: '',
      characteristics: '',
      challenges: '',
      interestReason: '',
      notes: []
    });
    setIsAdding(false);
    setSelected('');
    setCustomName('');
  };

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        className={`w-full py-2.5 rounded-xl border border-dashed text-body-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
          isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-900' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
        }`}
      >
        <Plus className="h-4 w-4" />
        業界を追加
      </button>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 space-y-2.5 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className={`w-full px-3 py-2 text-body-sm rounded-xl border focus:outline-hidden ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-gray-50 border-gray-200 text-gray-800'
        }`}
      >
        <option value="">業界を選択してください</option>
        {availableOptions.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="__custom__">その他（自由入力）</option>
      </select>

      {isCustom && (
        <input
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          placeholder="業界名を入力"
          autoFocus
          className={`w-full px-3 py-2 text-body-sm rounded-xl border focus:outline-hidden ${
            isDark ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600' : 'bg-gray-50 border-gray-200 placeholder:text-gray-350'
          }`}
        />
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={submit}
          disabled={!finalName}
          className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-body-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          追加する
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className={`px-4 py-2 rounded-xl text-body-sm font-bold cursor-pointer ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}

export default function ResearchView() {
  const { settings, isDark, industryResearch } = useApp();
  const theme = getTheme(settings.themeColor);

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h2 className={`text-title font-black tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          <Compass className={`h-5 w-5 ${theme.text}`} />
          業界・企業研究
        </h2>
        <p className={`text-body-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
          業界ごとに、登録済みの企業と気になる企業メモをまとめて整理できます
        </p>
      </div>

      <AddIndustryForm existingNames={industryResearch.map(r => r.industryName)} isDark={isDark} />

      {industryResearch.length === 0 && (
        <div className={`text-center py-10 text-body-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          <Factory className="h-6 w-6 mx-auto mb-2 opacity-40" />
          まだ業界研究がありません。まずは気になる業界を追加してみましょう
        </div>
      )}

      <div className="space-y-3">
        {industryResearch.map(industry => (
          <div key={industry.id}>
            <IndustryCard industry={industry} isDark={isDark} />
          </div>
        ))}
      </div>
    </div>
  );
}
