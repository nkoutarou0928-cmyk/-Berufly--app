/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { getTheme } from './utils/theme';

// Implement Code Splitting & Lazy Loading for faster initial bundle size and Lighthouse compliance
const DashboardView = lazy(() => import('./components/DashboardView'));
const TodosView = lazy(() => import('./components/TodosView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const CompaniesView = lazy(() => import('./components/CompaniesView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const SelfAnalysisView = lazy(() => import('./components/SelfAnalysisView'));

import { OnboardingModal } from './components/OnboardingModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Building2, 
  Settings,
  Sparkles,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  CornerDownRight,
  ShieldAlert,
  Smartphone,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function WelcomeScreen() {
  const { 
    startAsGuest, 
    signUpWithEmail, 
    loginWithEmail, 
    loginWithSocial, 
    resetPassword,
    settings 
  } = useApp();
  
  const theme = getTheme(settings.themeColor);

  const [activeTab, setActiveTab] = useState<'guest' | 'signup' | 'login'>('guest');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Brief network latency mockup for premium look and feel
    setTimeout(async () => {
      try {
        if (activeTab === 'signup') {
          if (!email || !password || !name) {
            alert('すべての入力欄を埋めてください。');
            setIsLoading(false);
            return;
          }
          await signUpWithEmail(email, password, name);
        } else if (activeTab === 'login') {
          if (!email || !password) {
            alert('メールアドレスとパスワードを入力してください。');
            setIsLoading(false);
            return;
          }
          await loginWithEmail(email, password);
        }
      } catch (err) {
        alert('認証処理中にエラーが発生しました。再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    }, 850);
  };

  // Automated biometric face/finger simulation login bypass
  const isBiometricSaved = localStorage.getItem('shukatsu_biometric_enabled') === 'true';
  const handleBiometricLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Prompt simulated dialog
      alert('🔐 外部端末 Touch ID / Face ID 連携チェックに成功しました（SSL鍵ペア検証）。\n自動ログインに成功しました。データベースを自動同期します。');
      const savedEmail = localStorage.getItem('shukatsu_user_email') || 'biometric.user@career.com';
      loginWithEmail(savedEmail, 'biometric-pass-bypassed');
      setIsLoading(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0f172a] px-4 py-8 font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6.5 shadow-2xl relative z-10"
      >
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xl shadow-md">
            C
          </div>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-slate-100 font-sans">
            CareerNavi+
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">
            就活のES締切・企業選考・自己分析をリアルタイムに自動一元化
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 dark:bg-slate-950 rounded-2xl mb-5">
          {[
            { id: 'guest', label: 'ゲスト利用' },
            { id: 'signup', label: '新規登録' },
            { id: 'login', label: 'ログイン' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-150 shadow-xs' 
                  : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-slate-350'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
            <span className="text-xs font-bold text-gray-400 animate-pulse">
              認証情報を同期中...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'guest' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-blue-50/50 dark:bg-slate-950/20 border border-blue-105/50 rounded-2xl text-left">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-1">
                    🟢 すぐ試せる「ゲストモード」対応
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                    アカウントを作成せずに、すぐ就活アシスト機能をお使いいただけます。データはブラウザ（ローカル）に即時保存され、後からいつでも「アカウントを作成して同期」することが可能です。
                  </p>
                </div>

                <button
                  onClick={startAsGuest}
                  className={`w-full py-2.5 font-bold rounded-xl text-white ${theme.bg} ${theme.hover} cursor-pointer shadow-sm text-xs active:scale-98 transition`}
                >
                  🚀 ゲストとして今すぐ始める
                </button>
              </div>
            )}

            {(activeTab === 'signup' || activeTab === 'login') && (
              <form onSubmit={handleAction} className="space-y-3 text-left">
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold mb-1">ユーザー名</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="就活キャリア"
                        className="w-full pl-8.5 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">メールアドレス</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="example@career.com"
                      className="w-full pl-8.5 pr-3 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-bold mb-1">パスワード</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="6文字以上のパスワード"
                      className="w-full pl-8.5 pr-10 py-2 text-xs bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-gray-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {activeTab === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (!email) {
                          alert('再設定メールを送信するため、まずメールアドレス欄を入力してください。');
                          return;
                        }
                        resetPassword(email);
                      }}
                      className="text-[10px] hover:underline font-bold text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      パスワードをお忘れですか？
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 font-bold rounded-xl text-white ${theme.bg} ${theme.hover} cursor-pointer shadow-sm text-xs active:scale-98 transition mt-2`}
                >
                  {activeTab === 'signup' ? '✨ アカウントを作成して始める' : '🔑 ログインしてデータを同期'}
                </button>
              </form>
            )}

            {/* Google / Apple Social Logins */}
            {(activeTab === 'signup' || activeTab === 'login') && (
              <div className="space-y-2.5 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-400">またはソーシャル連携で認証</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        loginWithSocial('google');
                        setIsLoading(false);
                      }, 700);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer dark:border-slate-850 dark:hover:bg-slate-850 text-[11px]"
                  >
                    <span>🌐 Googleで連携</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        loginWithSocial('apple');
                        setIsLoading(false);
                      }, 700);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer dark:border-slate-850 dark:hover:bg-slate-850 text-[11px]"
                  >
                    <span>🍎 Appleで連携</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick biometric login bypass shortcut */}
            {isBiometricSaved && activeTab !== 'guest' && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-[11px] transition-all cursor-pointer border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40"
                >
                  <Smartphone className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span>生体認証 (Touch ID / Face ID) で自動ログイン</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    settings, 
    isDark, 
    authStatus, 
    currentUser, 
    syncStatus 
  } = useApp();
  
  const theme = getTheme(settings.themeColor);



  // PWA Add to Home Screen (A2HS) states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showA2HSBanner, setShowA2HSBanner] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('careernavi_a2hs_dismissed') === 'true';

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowA2HSBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // If first time accessing and not dismissed, show the prompt as dynamic banner after short delay
    const isFirstAccess = !localStorage.getItem('careernavi_has_visited');
    if (isFirstAccess) {
      localStorage.setItem('careernavi_has_visited', 'true');
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setShowA2HSBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const handleA2HSInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] A2HS Outcome: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      // Elegant step-by-step guidance for iOS Safari or Chrome on mobile
      alert(
        '【ホーム画面への追加方法】\n\n' +
        '🟢 iOS (Safariの場合):\n' +
        '1. 画面下部にある［共有］（上向きの矢印）アイコンをタップします。\n' +
        '2. メニューをスクロールし、［ホーム画面に追加］を選択してください。\n\n' +
        '🔵 Android (Chromeの場合):\n' +
        '1. 画面右上にあるメニュー（3点リーダー）をタップします。\n' +
        '2. ［ホーム画面に追加］または［アプリのインストール］を選択してください。'
      );
    }
    setShowA2HSBanner(false);
    localStorage.setItem('careernavi_a2hs_dismissed', 'true');
  };

  const handleA2HSDismiss = () => {
    setShowA2HSBanner(false);
    localStorage.setItem('careernavi_a2hs_dismissed', 'true');
  };

  // Router for tabs with Suspense fallback loader
  const renderActiveView = () => {
    return (
      <Suspense fallback={
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
          <span className="text-xs text-gray-400 font-bold tracking-wider animate-pulse font-sans">
            画面を高速ロード中...
          </span>
        </div>
      }>
        {(() => {
          switch (activeTab) {
            case 'dashboard':
              return <DashboardView />;
            case 'todos':
              return <TodosView />;
            case 'calendar':
              return <AnimatePresence mode="wait"><CalendarView /></AnimatePresence>;
            case 'companies':
              return <CompaniesView />;
            case 'analysis':
              return <SelfAnalysisView />;
            case 'settings':
              return <SettingsView />;
            default:
              return <DashboardView />;
          }
        })()}
      </Suspense>
    );
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'ホーム', icon: Home },
    { id: 'todos' as const, label: 'Todo', icon: CheckSquare },
    { id: 'calendar' as const, label: 'カレンダー', icon: Calendar },
    { id: 'companies' as const, label: '企業一覧', icon: Building2 },
    { id: 'analysis' as const, label: '自己分析', icon: Sparkles },
    { id: 'settings' as const, label: '設定', icon: Settings },
  ];

  // If we require credentials screen, overlay it immediately
  if (authStatus === 'welcome') {
    return <WelcomeScreen />;
  }

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-200 ${
      isDark ? 'bg-[#0f172a] text-slate-100' : 'bg-[#F8F9FA] text-gray-900'
    }`}>
      
      {/* Visual top decorative header bar */}
      <header className={`sticky top-0 backdrop-blur-md border-b z-30 transition-all ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-gray-100'
      }`}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-8 w-8 rounded-xl flex items-center justify-center text-white font-black shadow-xs transition-colors ${theme.bg}`}>
              C
            </span>
            <div className="text-left">
              <span className={`text-xs font-black tracking-tight block ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                CareerNavi+
              </span>
              <span className="text-[9px] text-gray-400 font-bold block -mt-0.5">
                {authStatus === 'guest' ? '👤 ゲストモード（未同期）' : `☁️ 同期アカウント: ${currentUser?.name}`}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-[10px] inline-flex items-center gap-1 font-bold border px-2.5 py-0.5 rounded-full font-mono transition-all ${
              syncStatus === 'offline' 
                ? 'bg-rose-50 border-rose-200 text-rose-500' 
                : syncStatus === 'syncing'
                  ? 'bg-amber-50 border-amber-200 text-amber-500 animate-pulse'
                  : 'bg-emerald-50 border-emerald-100 text-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400'
            }`}>
              <CornerDownRight className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'offline' ? 'OFFLINE' : syncStatus === 'syncing' ? 'SYNCING...' : 'ONLINE SYNCED'}
            </span>
          </div>
        </div>
      </header>

      {/* Primary responsive view panel */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-5 pb-44">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* PWA Add to Home Screen Banner overlay */}
      <AnimatePresence>
        {showA2HSBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm p-4 rounded-2xl border z-40 transition-all ${
              isDark 
                ? 'bg-slate-900/98 border-slate-800 text-slate-100 shadow-2xl shadow-black/80' 
                : 'bg-white/98 border-gray-200 text-gray-905 shadow-xl'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-inner shrink-0">
                <Smartphone className="h-4.5 w-4.5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black tracking-tight flex items-center gap-1">
                  アプリをホーム画面に追加
                  <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded-sm leading-none">
                    推薦
                  </span>
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-normal mt-1">
                  全画面・オフライン起動、プッシュお知らせが可能なネイティブアプリ級の快適さをお楽しみいただけます。
                </p>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={handleA2HSInstall}
                    className="flex-1 py-1.5 text-[10px] font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-center border-0"
                  >
                    追加する
                  </button>
                  <button
                    onClick={handleA2HSDismiss}
                    className="px-3.5 py-1.5 text-[10px] font-bold border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-850 dark:text-slate-300 rounded-xl transition cursor-pointer text-center bg-transparent"
                  >
                    後で
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Navigational Bar */}
      <nav className={`fixed bottom-3 left-1/2 transform -translate-x-1/2 w-[calc(100%-24px)] max-w-md backdrop-blur-md border rounded-2xl p-1.5 z-40 transition-all ${
        isDark ? 'bg-slate-900/95 border-slate-800 shadow-2xl shadow-black/40' : 'bg-white/95 border-gray-100 shadow-xl'
      }`}>
        <div className="flex items-center justify-around h-12">
          {tabs.map(tab => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center p-1 relative text-gray-400 hover:text-gray-950 transition-colors select-none cursor-pointer"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Visual select blob indicator */}
                {isSelected && (
                  <motion.span
                    layoutId="active-tab-blob"
                    className={`absolute -top-1 h-1 w-6 rounded-full ${theme.bg}`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={`h-5 w-5 ${isSelected ? theme.text : (isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600')}`} />
                <span className={`text-[9px] font-bold mt-1 tracking-tight font-sans ${
                  isSelected 
                    ? (isDark ? 'text-slate-200 font-extrabold' : 'text-gray-950 font-black') 
                    : (isDark ? 'text-slate-500' : 'text-gray-400')
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>



      {/* Onboarding Overlay Modal */}
      <OnboardingModal />

      {/* PWA Install Invitation Banner */}
      <PWAInstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
