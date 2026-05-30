import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Info, 
  Settings, 
  Sliders, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  HeartHandshake, 
  Coins 
} from 'lucide-react';

// Highly relevant career / job hunting ads dataset
export interface CareerCampaign {
  id: string;
  title: string;
  sponsor: string;
  description: string;
  ctaText: string;
  url: string;
  badge: string;
  category: 'qualification' | 'career_portal' | 'prep_book' | 'ai_tool' | 'internship';
}

export const AD_CAMPAIGNS: CareerCampaign[] = [
  {
    id: 'rikunabi-es',
    title: '【ES突破率94%】リクナビ2026プレミアム自己分析診断ツール',
    sponsor: 'リクナビ新卒キャリア事業部',
    description: '登録不要＆5分で完了。大手選考を通過した20万件のESデータベースを学習したAIが、あなたの自己PRをプロレベルに自動添削します。期間限定で完全無料提供中！',
    ctaText: '自動診断を試す',
    url: 'https://job.rikunabi.com/',
    badge: '就活支援・公式PR',
    category: 'ai_tool'
  },
  {
    id: 'mynavi-qualification',
    title: '【SPI3・玉手箱】業界最速攻略オンライン模試＆対策レッスン',
    sponsor: 'マイナビライセンスパートナーズ',
    description: '非言語・言語の頻出パターンを完全攻略。今すぐ登録で1,500名限定のSPI非公開演習問題＆解説e-Book（PDF）を即時プレゼント。合格ボーダーを引き上げましょう！',
    ctaText: '問題集を無料ダウンロード',
    url: 'https://job.mynavi.jp/',
    badge: '筆記試験対策',
    category: 'qualification'
  },
  {
    id: 'abitus-cpa',
    title: '商社・金融・グローバル大手選考で圧倒的優位に立つ「USCPA」資格',
    sponsor: 'アビタス国際経営カレッジ',
    description: '国際会計基準を知るだけで商社やメガバンク選考で無双可能。大学生の合格者が近年急増中！まずは無料説明会で合格者のES実例集を無料ダウンロード。',
    ctaText: '無料Web案内資料を請求する',
    url: 'https://www.google.com/search?q=アビタス+USCPA',
    badge: '国際会計資格・推薦',
    category: 'qualification'
  },
  {
    id: 'toeic-shukatsu',
    title: '英語面接＆ES対策：TOEIC L&Rテスト短期800点突破プレミアム講座',
    sponsor: 'TOEIC推進キャリアアカデミー',
    description: '英語力アピールで外資系・大手メーカーの推薦ルートを獲得。1日20分の学習で最短かつ確実にスコアを引き上げるカリキュラム。入会金半額キャンペーン中！',
    ctaText: '特別体験レッスン窓口へ',
    url: 'https://www.google.com/search?q=TOEIC+就職活動',
    badge: '語学スクール',
    category: 'qualification'
  },
  {
    id: 'coconala-essay',
    title: '一流企業OB・OG人事が直接マンツーマンでES/面接対策を徹底添削',
    sponsor: 'ココナラキャリアプラットフォーム',
    description: '志望動機がまとまらない？総合商社、ITメガ、大手広告の現役・元採用官1,200名から直接レビューをもらえる！合格ES集のサンプルも多数閲覧可能です。',
    ctaText: '添削のプロを探す',
    url: 'https://www.google.com/search?q=ココナラ+就活ES添削',
    badge: '自己PR・ES指導',
    category: 'ai_tool'
  },
  {
    id: 'gaishi-internship',
    title: '【選考直結型】外資コングロマリット＆ITコンサル夏のプレミアム特別枠',
    sponsor: 'CareerNavi+ 提携エージェント',
    description: '一般公開前の超上流インターン枠。メンターが志望動機作成からグループディスカッション対策まで専属サポート。早期内定獲得ルートへ最速ナビゲート！',
    ctaText: '非公開インターンを探す',
    url: 'https://www.google.com/',
    badge: '早期内定・直結型',
    category: 'internship'
  }
];

// Helper to toggle all AdSense displays in application
export const getAdSenseSettings = (): { enabled: boolean } => {
  const stored = localStorage.getItem('careernavi_adsense_enabled');
  if (stored === null) return { enabled: true }; // Enabled by default
  return { enabled: stored === 'true' };
};

export const setAdSenseSettings = (enabled: boolean) => {
  localStorage.setItem('careernavi_adsense_enabled', enabled ? 'true' : 'false');
  // Dispatch local storage event so all components immediately sync
  window.dispatchEvent(new Event('storage'));
};

// Ad loading status hooks allowing skeleton screen simulation
function useAdSenseLoader() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const reloadSettings = () => {
    const config = getAdSenseSettings();
    setEnabled(config.enabled);
  };

  useEffect(() => {
    reloadSettings();
    
    // Listen for changes
    window.addEventListener('storage', reloadSettings);
    
    // Simulation logic mimicking real Google AdSense network round-trip setup
    const timer = setTimeout(() => {
      // 95% success rate for ads; 5% fallback to error hide state
      if (Math.random() < 0.05) {
        setError(true);
      }
      setLoading(false);
    }, 750);

    return () => {
      window.removeEventListener('storage', reloadSettings);
      clearTimeout(timer);
    };
  }, []);

  return { loading, error, enabled };
}

/**
 * 1. Bottom Banner Ad (Google AdSense Mock)
 * Placed neatly on top of the floating bottom navigation bar
 */
export function AdSenseBanner() {
  const { loading, error, enabled } = useAdSenseLoader();
  const [closed, setClosed] = useState(false);
  const [campaign, setCampaign] = useState<CareerCampaign | null>(null);

  useEffect(() => {
    // Select a semi-random ad campaign from the dataset
    const idx = Math.floor(Math.random() * AD_CAMPAIGNS.length);
    setCampaign(AD_CAMPAIGNS[idx]);

    // Safely trigger Google AdSense standard push of layout parameters
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense Banner deferred push skipped:', e);
    }
  }, []);

  if (!enabled || error || closed || !campaign) return null;

  const handleOpenAd = (e: React.MouseEvent) => {
    // Tap spacing mitigation rule - protects from fast misclicking action targets
    e.stopPropagation();
    window.open(campaign.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-[74px] left-1/2 transform -translate-x-1/2 w-[calc(100%-24px)] max-w-md z-30 select-none px-1">
      <AnimatePresence mode="wait">
        {loading ? (
          // Skeleton loader protecting Layout shifts
          <motion.div 
            key="skeleton"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 animate-pulse"
          >
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-800 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-sm w-1/4" />
              <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-sm w-11/12" />
            </div>
            <div className="h-4 w-4 bg-gray-200 dark:bg-slate-800 rounded-full" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-950/75 rounded-2xl shadow-xl hover:shadow-2xl transition overflow-hidden relative"
            id="adsense-bottom-banner"
          >
            {/* Google AdSense dynamic insertion element */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
              data-ad-client="ca-pub-mock-careernavi"
              data-ad-slot="1234567890"
              data-full-width-responsive="true"
            />

            {/* Tag / Sponsor line */}
            <div className="bg-amber-50 dark:bg-amber-950/20 px-3 py-1 text-[8.5px] text-amber-800 dark:text-amber-400 font-bold border-b border-amber-100 dark:border-amber-950/20 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="bg-amber-500 text-white rounded-[4px] px-1 py-0.2 select-none font-black text-[7px] uppercase tracking-wider">AdSense</span>
                <span>📌 スポンサードリンク ({campaign.badge})</span>
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setClosed(true);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                title="広告を閉じる"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Clickable zone with generous non-misleading borders */}
            <div 
              onClick={handleOpenAd}
              className="p-3 cursor-pointer flex items-center justify-between gap-3 text-left hover:bg-slate-50/50 dark:hover:bg-slate-950/20 active:bg-slate-100 transition-colors duration-150"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Visual Category Icon */}
                <div className="h-10 w-10 shrink-0 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
                  {campaign.category === 'qualification' && <GraduationCap className="h-5 w-5" />}
                  {campaign.category === 'prep_book' && <BookOpen className="h-5 w-5" />}
                  {campaign.category === 'ai_tool' && <Sparkles className="h-5 w-5" />}
                  {campaign.category === 'career_portal' && <Briefcase className="h-5 w-5" />}
                  {campaign.category === 'internship' && <HeartHandshake className="h-5 w-5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <h5 className="text-[11px] font-black tracking-tight text-gray-900 dark:text-slate-100 truncate">
                    {campaign.title}
                  </h5>
                  <p className="text-[9.5px] text-gray-400 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {campaign.description}
                  </p>
                </div>
              </div>

              {/* Action Button outside immediate text core with spacing boundary protector */}
              <div className="shrink-0 pl-1">
                <span className="inline-flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 hover:scale-103 font-bold text-white rounded-xl text-[9px] shadow-sm transition-all select-none">
                  {campaign.ctaText}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 2. Native Ad (Inserts comfortably inside lists)
 * Fits perfectly in lists with matching layout
 */
export function AdSenseNative({ index }: { index: number }) {
  const { loading, error, enabled } = useAdSenseLoader();
  const [campaign, setCampaign] = useState<CareerCampaign | null>(null);

  useEffect(() => {
    // Select based on index to ensure deterministic matching in lists
    const campaignIndex = index % AD_CAMPAIGNS.length;
    setCampaign(AD_CAMPAIGNS[campaignIndex]);

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense Native deferred push skipped:', e);
    }
  }, [index]);

  if (!enabled || error || !campaign) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs animate-pulse space-y-3 select-none">
        <div className="flex items-center justify-between">
          <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded-sm w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-sm w-12" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-sm w-11/12" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-sm w-8/12" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-xl w-full" />
      </div>
    );
  }

  const handleOpenAd = () => {
    window.open(campaign.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-955/20 dark:to-slate-900 border border-indigo-150 dark:border-slate-800 rounded-2xl p-4.5 shadow-sm relative overflow-hidden text-left"
      id={`adsense-native-${index}`}
    >
      {/* Google AdSense dynamic insertion element */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
        data-ad-client="ca-pub-mock-careernavi"
        data-ad-format="fluid"
        data-ad-layout-key="-gw-3+1s-9t+5p"
        data-ad-slot="9876543210"
      />

      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 px-2 py-0.5 rounded-md uppercase border border-amber-100 dark:border-amber-950/30">
          <Sparkles className="h-3 w-3" />
          スポンサー広告
        </span>
        <span className="text-[9.5px] font-bold text-gray-400 select-none">
          {campaign.sponsor}
        </span>
      </div>

      <h4 className="text-xs font-black tracking-tight text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
        {campaign.title}
      </h4>
      
      <p className="text-[10.5px] leading-relaxed text-gray-500 dark:text-gray-400 mt-2">
        {campaign.description}
      </p>

      <div className="mt-3.5 pt-3 border-t border-indigo-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
          <Info className="h-3 w-3" />
          就活生のデータに基づくパーソナライズ広告
        </span>
        
        <button
          onClick={handleOpenAd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10.5px] py-2 px-4.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-97 flex items-center gap-1"
        >
          <span>{campaign.ctaText}</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Decorative top badge border */}
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-amber-400 via-indigo-500 to-sky-450" />
    </div>
  );
}

/**
 * 3. Interstitial Full-Screen Ad
 * Triggers nicely on screen/tab changes
 */
interface InterstitialProps {
  onClose: () => void;
}

export function AdSenseInterstitial({ onClose }: InterstitialProps) {
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CareerCampaign | null>(null);

  useEffect(() => {
    // Select standard premium interstitial camp
    const idx = Math.floor(Math.random() * AD_CAMPAIGNS.length);
    setCampaign(AD_CAMPAIGNS[idx]);

    // Fast loading spinner duration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense Interstitial deferred push skipped:', e);
    }

    return () => clearTimeout(timer);
  }, []);

  if (!campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-3"
          >
            <div className="h-9 w-9 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-300 font-medium">スポンサー広告をロード中...</span>
          </motion.div>
        ) : (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border border-indigo-100 dark:border-slate-800"
          >
            {/* Google AdSense dynamic insertion element */}
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden' }}
              data-ad-client="ca-pub-mock-careernavi"
              data-ad-slot="3333333333"
              data-ad-format="auto"
            />

            {/* Upper label banner */}
            <div className="bg-gradient-to-r from-amber-400 to-indigo-600 px-4 py-2 text-white flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider uppercase bg-amber-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Google AdSense スポンサー
              </span>
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 p-1 rounded-full transition cursor-pointer"
                title="閉じる"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Content box */}
            <div className="p-6 space-y-4 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                {campaign.category === 'qualification' && <GraduationCap className="h-6 w-6" />}
                {campaign.category === 'prep_book' && <BookOpen className="h-6 w-6" />}
                {campaign.category === 'ai_tool' && <Sparkles className="h-6 w-6" />}
                {campaign.category === 'career_portal' && <Briefcase className="h-6 w-6" />}
                {campaign.category === 'internship' && <HeartHandshake className="h-6 w-6" />}
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full select-none">
                  🔍 提供: {campaign.sponsor}
                </span>
                <h3 className="text-sm font-black text-gray-900 dark:text-slate-100 tracking-tight leading-snug pt-1">
                  {campaign.title}
                </h3>
              </div>

              <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                {campaign.description}
              </p>

              {/* Action trigger button */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.open(campaign.url, '_blank', 'noopener,noreferrer');
                    onClose();
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {campaign.ctaText}
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-650 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  広告を閉じてアプリへ戻る
                </button>
              </div>

              <div className="flex items-center justify-center gap-1 text-[8.5px] text-gray-400 font-medium">
                <Info className="h-3 w-3" />
                閉じるボタンですぐに戻れます
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 4. Google AdSense compliant Privacy Policy notice and guidelines.
 * Displayed cleanly under details or settings
 */
export function AdSensePrivacyPolicy() {
  return (
    <div className="space-y-4 text-left p-4.5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-xs">
      <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-slate-800">
        <FileText className="h-5 w-5 text-indigo-500" />
        <h4 className="text-xs font-black tracking-tight text-gray-900 dark:text-slate-100">
          広告配信およびプライバシーポリシー
        </h4>
      </div>

      <div className="space-y-3.5 text-[10.5px] leading-relaxed text-gray-500 dark:text-gray-400">
        <p>
          本アプリ『CareerNavi+』では、第三者配信事業者（Google含む）が提供する広告サービス「Google AdSense」ならびに提携パートナー広告配信サービスを導入しております。
        </p>

        <div>
          <h5 className="font-bold text-gray-800 dark:text-slate-200 block mb-0.5">
            1. パーソナライズ広告（パーソナルクッキーおよび識別コードの使用）
          </h5>
          <p>
            Google等の広告配信事業者は、Cookie等の識別データ技術を使用して、ユーザーが本アプリならびに過去にアクセスした他のウェブサイトやアプリの閲覧情報に基づき、ユーザーに親和性の高い適切な広告（就活情報、転職情報、各種キャリア・語学資格、適性対策書籍など）を予測選択し優先配信します。
          </p>
        </div>

        <div>
          <h5 className="font-bold text-gray-800 dark:text-slate-200 block mb-0.5">
            2. 広告プライバシー（パーソナライズ広告の配信オプトアウトについて）
          </h5>
          <p>
            ユーザーは、Googleのサービス管理下である「<a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-bold">広告設定<ExternalLink className="h-2.5 w-2.5" /></a>」にアクセスすることにより、パーソナライズ広告をいつでも無効化することができます。また、外部配信を制限するクッキー管理ツールの設定も可能です。
          </p>
        </div>

        <div>
          <h5 className="font-bold text-gray-800 dark:text-slate-200 block mb-0.5">
            3. アプリケーション内広告配信の一括制限機能について
          </h5>
          <p>
            本アプリでは、ユーザー様自身の意思判断で広告の表示・非表示を素早くコントロールできる【広告一括配信オン・オフ制御スイッチ】を提供しております。広告を一時的に停止したい場合は、設定画面から制御スイッチをOFFに切替えてください。
          </p>
        </div>

        <div className="bg-indigo-50/50 dark:bg-slate-955/20 border border-indigo-100 dark:border-slate-800 rounded-xl p-3 flex items-start gap-2.5">
          <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-800 dark:text-indigo-300">
            ※CareerNavi+での個人メモ(登録された企業名や自己PRシートの記載内容、ログイン用パスワード等のセンシティブ情報など)が、外部のAdSenseサーバー、広告他社、または無関係の第三者に閲覧・送信・共有されることは決してございません。ご安心ください。
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 5. Quick preference widget for toggling ads
 */
export function AdSensePreferencesToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(getAdSenseSettings().enabled);
  }, []);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setAdSenseSettings(checked);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-4.5 shadow-xs flex items-center justify-between gap-4">
      <div className="text-left space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Sliders className="h-4.5 w-4.5 text-indigo-500" />
          <h4 className="text-xs font-black text-gray-900 dark:text-slate-100">
            AdSense 広告パーソナライズ設定
          </h4>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-slate-400">
          アプリ内のバナー・インタースティシャル・ネイティブ広告表示を制御
        </p>
      </div>

      <div className="flex items-center shrink-0">
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-250 peer-focus:outline-hidden rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-250 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-705 peer-checked:bg-indigo-650" />
        </label>
      </div>
    </div>
  );
}
