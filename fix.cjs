const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'CompaniesView.tsx');
if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(1);
}

let code = fs.readFileSync(filePath, 'utf8');

// Part 1: Declare state viewMode
const stateHookTarget = "const [activeTab, setActiveTabState] = useState<'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'>(detailTab as any || 'basic');";
const stateHookReplacement = "const [activeTab, setActiveTabState] = useState<'basic' | 'es' | 'interview' | 'notes' | 'ob_visits' | 'comparisons'>(detailTab as any || 'basic');\n  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');";

if (code.includes(stateHookTarget)) {
  code = code.replace(stateHookTarget, stateHookReplacement);
  console.log("Declared viewMode state successfully.");
} else {
  console.log("Could not find state hook target.");
}

// Part 2: Replace broken segmented control buttons + duplicated lists blocks with pristine filters & lists
// Target begins at:
//                 <div className={`flex rounded-lg p-0.5 border ${
//                   isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-100/60 border-gray-205'
//                 }`}>
// up to status map:
//                 {(['interested', 'es_planned', 'es_submitted', 'selecting', 'offered', 'rejected'] as CompanyStatus[]).map(status => {
//                   const groupCompanies = companyGroups[status];

const searchRegex = /<div className=\{\`flex rounded-lg p-0\.5 border[\s\S]*?as CompanyStatus\[\]\)\.map\(status => \{\s*const groupCompanies = companyGroups\[status\];/;

if (searchRegex.test(code)) {
  console.log("Main lists segment matched successfully.");

  const replacementBlock = `<div className={\`flex rounded-lg p-0.5 border \${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-gray-100/60 border-gray-200'
                }\`}>
                  <button
                    type="button"
                    onClick={() => setViewMode('grouped')}
                    className={\`text-[10px] py-1 px-2.5 rounded-md font-bold cursor-pointer transition-all \${
                      viewMode === 'grouped'
                        ? (isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-900 shadow-3xs')
                        : 'text-gray-400 hover:text-gray-650'
                    }\`}
                  >
                    ステータス別
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={\`text-[10px] py-1 px-2.5 rounded-md font-bold cursor-pointer transition-all \${
                      viewMode === 'list'
                        ? (isDark ? 'bg-slate-800 text-slate-200' : 'bg-white text-gray-900 shadow-3xs')
                        : 'text-gray-400 hover:text-gray-650'
                    }\`}
                  >
                    一覧
                  </button>
                </div>

                <button
                  onClick={() => setShowAddCompanyModal(true)}
                  className={\`flex items-center gap-1 text-[10px] font-black py-1.5 px-3 rounded-lg text-white cursor-pointer transition-all \${theme.bg} \${theme.hover} shadow-xs\`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  企業を追加
                </button>
              </div>
            </div>

            {/* --- Filter & Search Controls --- */}
            <div className={\`p-4 rounded-3xl border \${
              isDark ? 'bg-slate-900/20 border-slate-800' : 'bg-gray-50/50 border-gray-100'
            } space-y-3 text-xs\`}>
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
                    className={\`w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-gray-200 transition-all \${
                      isDark ? 'bg-slate-900/40 border-slate-800 focus:border-sky-400 text-white' : 'focus:border-sky-400 text-gray-950'
                    }\`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value as any)}
                      className={\`w-full px-2.5 py-2 text-[10px] line-clamp-1 bg-white rounded-xl border border-gray-200 \${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }\`}
                    >
                      <option value="all">選考：すべて</option>
                      <option value="interested">検討中</option>
                      <option value="es_planned">ES作成予定</option>
                      <option value="es_submitted">ES提出済</option>
                      <option value="selecting">選考中</option>
                      <option value="offered">内定</option>
                      <option value="rejected">選考終了</option>
                    </select>
                  </div>

                  <div className="relative">
                    <select
                      value={filterPreference}
                      onChange={e => setFilterPreference(e.target.value as any)}
                      className={\`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 \${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }\`}
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
                      className={\`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 \${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }\`}
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
                      className={\`w-full px-2.5 py-2 text-[10px] bg-white rounded-xl border border-gray-200 \${
                        isDark ? 'bg-slate-900 text-white border-slate-800' : 'text-gray-700'
                      }\`}
                    >
                      <option value="newest">追加：新しい順</option>
                      <option value="preference">志望度順</option>
                      <option value="deadline">締切近い順</option>
                      <option value="status">選考フェーズ順</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

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
                  <div className="flex justify-between items-center sm:pb-2">
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
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">業界</label>
                      <input 
                        type="text"
                        required
                        value={newIndustry}
                        onChange={e => setNewIndustry(e.target.value)}
                        placeholder="（例）IT・通信、コンサルティング"
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">ステータス</label>
                        <select
                          value={newStatus}
                          onChange={e => setNewStatus(e.target.value as CompanyStatus)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                        >
                          <option value="interested">検討中</option>
                          <option value="es_planned">ES作成予定</option>
                          <option value="es_submitted">ES提出済</option>
                          <option value="selecting">選考中</option>
                          <option value="offered">内定</option>
                          <option value="rejected">選考終了</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">選考状況段階</label>
                        <select
                          value={newSelectionStage}
                          onChange={e => setNewSelectionStage(e.target.value as any)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl"
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">志望度</label>
                        <div className="flex gap-1.5 h-10 items-center pl-1 bg-gray-50 border border-gray-200 rounded-xl">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewPreference(star)}
                              className="text-gray-300 hover:text-amber-400 cursor-pointer transition-colors"
                            >
                              <Star className={\`h-5 w-5 \${newPreference >= star ? 'fill-amber-400 text-amber-400' : ''}\`} />
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
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">面接予定日</label>
                      <input 
                        type="date"
                        value={newInterviewDate}
                        onChange={e => setNewInterviewDate(e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-700"
                      />
                    </div>

                    <button
                      type="submit"
                      className={\`w-full py-3 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs \${theme.bg} \${theme.hover}\`}
                    >
                      企業を追加する
                    </button>
                  </form>
                </motion.div>
              </div>
            )}

            {/* --- COMPANY LIST RENDERING --- */}
            {viewMode === 'list' ? (
              <div className="space-y-3">
                {sortedCompanies.length === 0 ? (
                  <div className={\`py-12 text-center text-xs space-y-2 rounded-2xl border border-dashed \${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-200 text-gray-400'
                  }\`}>
                    <p>該当する企業は見つかりませんでした</p>
                    <p className="text-[10px] text-gray-450 font-sans">検索・フィルター条件を調整してください</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sortedCompanies.map(co => {
                      const design = STATUS_COLORS[co.status];
                      return (
                        <div
                          key={co.id}
                          onClick={() => {
                            setSelectedCompanyId(co.id);
                            setActiveTabState('basic');
                          }}
                          className={\`p-4 rounded-3xl border shadow-3xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group text-left \${
                            isDark 
                              ? \`bg-slate-900 border-slate-800/80 hover:border-\${settings.themeColor}-400\` 
                              : \`bg-white border-gray-100 hover:border-\${settings.themeColor}-200\`
                          }\`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className={\`text-xs font-bold truncate transition-colors \${
                                isDark ? 'text-slate-100 group-hover:text-white' : 'text-gray-950 group-hover:text-black'
                              }\`}>
                                {co.name}
                              </h4>
                              <span className={\`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase text-center border \${design.bg} \${design.text} \${design.border}\`}>
                                {STATUS_LABELS[co.status]}
                              </span>
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
                                <span className={\`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono \${
                                  isDark ? 'bg-rose-950/45 text-rose-300 border border-rose-900' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                }\`}>
                                  <Clock className="h-2.5 w-2.5" />
                                  締切: {co.esDeadline}
                                </span>
                              )}
                              {co.interviewDate && (
                                <span className={\`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm font-mono \${
                                  isDark ? 'bg-blue-950/45 text-blue-300 border border-blue-900' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }\`}>
                                  <Calendar className="h-2.5 w-2.5" />
                                  面接: {co.interviewDate}
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* --- Status grouped lists showing with badges count --- */
              <div className="space-y-6">
                {(['interested', 'es_planned', 'es_submitted', 'selecting', 'offered', 'rejected'] as CompanyStatus[]).map(status => {
                  const groupCompanies = companyGroups[status];
                  const design = STATUS_COLORS[status];

                  return (
                    <div key={status} className="space-y-2.5 text-left">`;

  code = code.replace(searchRegex, replacementBlock);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log("Main lists segment successfully repaired!");
} else {
  console.error("Main searchRegex target not found inside CompaniesView.tsx!");
}
