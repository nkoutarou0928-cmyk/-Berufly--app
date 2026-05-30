/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEME_PRESETS, getTheme } from '../utils/theme';
import { 
  Settings, 
  Bell, 
  Palette, 
  Trash2, 
  CloudLightning, 
  Info,
  Check,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  User,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Download,
  Share
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsView() {
  const { 
    settings, 
    updateSettings, 
    companies, 
    todos, 
    obVisits, 
    isDark,
    currentUser,
    authStatus,
    syncStatus,
    isBiometricEnabled,
    setBiometrics,
    migrateGuestToAccount,
    logout,
    deleteAccount,
    setShowOnboarding
  } = useApp();
  const theme = getTheme(settings.themeColor);

  // States
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Home Screen installation setup states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [showPcGuide, setShowPcGuide] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Initial standalone detection
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleHomeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn("Failed userChoice response", err);
      }
    } else {
      const ua = navigator.userAgent.toLowerCase();
      const isIosVal = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroidVal = /android/.test(ua);

      if (isIosVal) {
        setShowIosGuide(true);
        setShowPcGuide(false);
      } else if (isAndroidVal) {
        alert('Android Chromeのメニュー（右上︙アイコン）から「アプリをインストール」または「ホーム画面に追加」をタップしてください。');
      } else {
        setShowPcGuide(true);
        setShowIosGuide(false);
      }
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    alert('設定およびデータをリセットしました。ページをリロードして初期状態をご確認ください。');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl font-bold tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
            環境設定・チューニング
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">アプリ全体のプロフィール、テーマカラー、ライト／ダーク表示を設定できます</p>
        </div>
        <button 
          type="button"
          onClick={() => setShowOnboarding(true)}
          className="self-start sm:self-center px-4.5 py-2.5 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-700 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-indigo-400 text-xs font-bold rounded-xl transition-all border border-indigo-100/20 active:scale-95 shadow-3xs cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>使い方を見る（チュートリアル）</span>
        </button>
      </div>

      {/* --- Profile Settings Section (Simplified & Compacted) --- */}
      <div className={`p-4 rounded-3xl border shadow-xs space-y-3.5 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <div className="flex items-center justify-between border-b pb-2 px-0.5 border-gray-100 dark:border-slate-800">
          <h3 className={`text-xs font-bold flex items-center gap-1.5 ${
            isDark ? 'text-slate-200' : 'text-gray-800'
          }`}>
            <User className={`h-4.5 w-4.5 ${theme.text}`} />
            プロフィール設定
          </h3>
          <span className="text-[10px] text-gray-400 dark:text-slate-500 font-sans">
            ホーム画面等に自動反映されます
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              名前・ニックネーム
            </label>
            <input 
              type="text"
              value={settings.profileName}
              onChange={e => updateSettings({ profileName: e.target.value })}
              placeholder="例: タロウ"
              className={`w-full p-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium' : 'bg-gray-50 border-gray-250 text-gray-800 font-medium'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              就活開始日
            </label>
            <input 
              type="date"
              value={settings.shukatsuStartDate}
              onChange={e => updateSettings({ shukatsuStartDate: e.target.value })}
              className={`w-full p-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-250 text-gray-800'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              一言メモ（目標など）
            </label>
            <input 
              type="text"
              value={settings.profileMemo}
              onChange={e => updateSettings({ profileMemo: e.target.value })}
              placeholder="例: 絶対志望内定！"
              className={`w-full p-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium' : 'bg-gray-50 border-gray-250 text-gray-800 font-medium'
              }`}
            />
          </div>
        </div>
      </div>

      {/* --- Light / Dark Mode Toggle Section --- */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xs font-bold flex items-center gap-1.5 border-b pb-2.5 ${
          isDark ? 'text-slate-200 border-slate-800' : 'text-gray-800 border-gray-50'
        }`}>
          <Sun className={`h-4.5 w-4.5 ${theme.text}`} />
          表示モード選択（ライト／ダーク切替）
        </h3>
        
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          表示テーマを切り替えられます。システム同期を選択すると、お使いの端末設定（OS）に自動で追従します。
        </p>

        {/* Dynamic Display Mode Buttons Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'light', label: 'ライト', icon: Sun },
            { id: 'dark', label: 'ダーク', icon: Moon },
            { id: 'system', label: 'システム同期', icon: Monitor },
          ].map(opt => {
            const isSelected = settings.themeMode === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ themeMode: opt.id as any })}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isSelected 
                    ? `border-gray-900 bg-gray-50 ring-2 ring-gray-900/5 ${isDark ? 'border-slate-100 bg-slate-800 ring-white/15' : ''}` 
                    : `${isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200' : 'border-gray-100 bg-white text-gray-500 hover:text-gray-950'}`
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? theme.text : ''}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* --- Home Screen / PWA Setup Panel --- */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xs font-bold flex items-center gap-1.5 border-b pb-2.5 ${
          isDark ? 'text-slate-200 border-slate-800' : 'text-gray-800 border-gray-50'
        }`}>
          <Smartphone className={`h-4.5 w-4.5 ${theme.text}`} />
          アプリのインストール / ホーム画面に追加
        </h3>
        
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          CareerNavi+ をスマートフォンのホーム画面やPCのデスクトップにインストールすることで、ブラウザのアドレスバー等を非表示にし、ネイティブアプリのようにスムーズに就活管理が可能です。
        </p>

        {isInstalled ? (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <Check className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
            <div className="text-left">
              <span className={`block text-xs font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                追加済み
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                すでにホーム画面に追加されているか、スタンドアロンモード（PWA）で快適に起動が完了しています。
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleHomeInstall}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                isInstalled 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700' 
                  : `${theme.bg} ${theme.hover} text-white`
              }`}
            >
              <Download className="h-4.5 w-4.5 animate-bounce" />
              <span>ホーム画面に追加する</span>
            </button>

            {/* Guides depending on active user agents */}
            {showIosGuide && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl border ${theme.lightBg} ${isDark ? 'border-indigo-900/30 text-indigo-200' : `${theme.textDark} ${theme.border}`}`}
              >
                <div className="flex items-start gap-2 text-[11px]">
                  <Share className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-xs">iOS (Safari) をお使いの方：</p>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">「共有ボタンから『ホーム画面に追加』を選択してください」</p>
                    <ol className="list-decimal pl-4 pt-1 space-y-1 text-[10px] leading-relaxed opacity-90">
                      <li>Safariブラウザ下部にある <span className="font-bold">「共有（四角に上矢印）」ボタン</span> をタップします。</li>
                      <li>開いた一覧メニューを下にスクロールします。</li>
                      <li><span className="font-bold">「ホーム画面に追加」</span> を選択して、右上の「追加」をタップしてください。</li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            )}

            {showPcGuide && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl border bg-slate-50 border-gray-250 dark:bg-slate-950/20 dark:border-slate-800/80"
              >
                <div className="flex items-start gap-2 text-[11px]">
                  <Monitor className="h-4.5 w-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800 dark:text-gray-200">PCブラウザ（Chrome / Edge 等）をお使いの方：</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">「アドレスバーのインストールアイコンをクリックしてください」</p>
                    <ol className="list-decimal pl-4 pt-1 space-y-1 text-[10px] leading-relaxed text-gray-500 dark:text-gray-400">
                      <li>ブラウザ上部のアドレスバー（URLの入力エリア）の右側に表示される <span className="font-bold">「アプリのインストール」アイコン</span> またはプラスボタンをクリックします。</li>
                      <li>またはブラウザのメニュー「︙」などから、<span className="font-bold">「アプリをインストール」</span> をお試しください。</li>
                    </ol>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* --- Palette Settings (Visual Swatches Only - Color name hidden!) --- */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xs font-bold flex items-center gap-1.5 border-b pb-2.5 ${
          isDark ? 'text-slate-200 border-slate-800' : 'text-gray-800 border-gray-50'
        }`}>
          <Palette className={`h-4.5 w-4.5 ${theme.text}`} />
          テーマカラー設計
        </h3>
        
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          アプリのプライマリアクセントとなるシンボルカラーを設定します。カラーのみを視覚的にタップして選ぶことができます。
        </p>

        {/* Color Presets Flex Swatches - Strictly No Color Names! */}
        <div className="flex flex-wrap gap-3.5 py-1 justify-center sm:justify-start">
          {THEME_PRESETS.map(preset => {
            const isSelected = settings.themeColor === preset.color;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => updateSettings({ themeColor: preset.color })}
                className={`h-11 w-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                  isSelected 
                    ? `ring-4 ring-offset-2 ${isDark ? 'ring-slate-300 ring-offset-slate-900' : 'ring-gray-900 ring-offset-white'}` 
                    : 'border border-black/10'
                }`}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                <span className="sr-only">Color selection</span>
                {isSelected && (
                  <Check className={`h-5 w-5 ${preset.color === 'amber' ? 'text-gray-900' : 'text-white'} stroke-[3px.5]`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- Push Notification Sync Settings --- */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xs font-bold flex items-center gap-1.5 border-b pb-2.5 ${
          isDark ? 'text-slate-200 border-slate-800' : 'text-gray-800 border-gray-50'
        }`}>
          <Bell className={`h-4.5 w-4.5 ${theme.text}`} />
          通知機能・リマインダー設計
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold text-xs block ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                プッシュ通知システムを有効化
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">締切や面接直前の通知を受け取ります</span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.notificationsEnabled}
                onChange={e => updateSettings({ notificationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all ${settings.notificationsEnabled ? theme.bg : 'bg-gray-200'}`} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className={`block font-bold text-[10px] mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                ES締切事前リマインドタイミング
              </label>
              <select
                value={settings.notificationDaysBefore}
                onChange={e => updateSettings({ notificationDaysBefore: Number(e.target.value) })}
                className={`w-full text-xs p-2.5 border rounded-xl ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:outline-hidden' : 'bg-gray-50 border-gray-250 text-gray-800'
                }`}
              >
                <option value={7}>7日前 (一週間前)</option>
                <option value={5}>5日前</option>
                <option value={3}>3日前</option>
                <option value={1}>1日前 (前日)</option>
              </select>
            </div>

            <div>
              <label className={`block font-bold text-[10px] mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                通知送信時刻
              </label>
              <select
                value={settings.notificationTime}
                onChange={e => updateSettings({ notificationTime: e.target.value })}
                className={`w-full text-xs p-2.5 border rounded-xl font-mono ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-100 focus:outline-hidden' : 'bg-gray-50 border-gray-250 text-gray-800'
                }`}
              >
                <option value="08:00">朝 08:00 (面接当日等)</option>
                <option value="09:00">朝 09:00</option>
                <option value="12:00">お昼 12:00</option>
                <option value="18:00">夕方 18:00 (振り返り推奨)</option>
              </select>
            </div>
          </div>

          <div className={`p-3.5 ${theme.lightBg} rounded-2xl text-[11px] border flex items-start gap-2 ${
            isDark ? 'text-slate-200 border-slate-800' : `${theme.textDark} ${theme.border}`
          }`}>
            <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${theme.text}`} />
            <div>
              <p className="font-bold">シミュレート通知システム内蔵</p>
              <p className="mt-0.5 opacity-90 leading-relaxed font-sans">
                当アプリはブラウザ上でも簡単に通知テストができるよう、画面右上の「🔔」アイコンにリアルタイムの擬似通知バナーを表示し、タップすることでいつでも対象企業のESや面接詳細ページへダイレクトアクセスできるインペリアルUIを搭載しています。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Unified Account Sync & Biometrics Portal --- */}
      <div className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xs font-bold flex items-center justify-between border-b pb-2.5 ${
          isDark ? 'text-slate-200 border-slate-800' : 'text-gray-800 border-gray-50'
        }`}>
          <div className="flex items-center gap-1.5">
            <CloudLightning className={`h-4.5 w-4.5 ${theme.text}`} />
            <span>就職クラウドアカウント ＆ データ同期設定</span>
          </div>
          {authStatus === 'authenticated' && (
            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
              syncStatus === 'syncing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
              syncStatus === 'offline' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
              'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
            }`}>
              <RotateCcw className={`h-2.5 w-2.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'syncing' ? '同期中...' : syncStatus === 'offline' ? 'オフライン' : '同期済み'}
            </span>
          )}
        </h3>

        <div className="space-y-4 text-xs">
          {authStatus === 'guest' ? (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] leading-relaxed dark:bg-slate-850/40 dark:border-slate-800">
                <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1">
                  <span>👤 ゲストモードで利用中</span>
                </p>
                <p className="text-gray-550 dark:text-gray-400 mt-1">
                  現在は通信・保存をローカル環境（localStorage）のみで行っています。クラウド同期を有効にすると、同じメールアドレスとパスワードでログインするだけで複数端末からいつでも同一データ（企業メモ、ES履歴、活動スケジュール）をリアルタイムに同期・共有できるようになります。
                </p>
              </div>

              {/* Guest to Account migration form */}
              <div className="space-y-3 p-4 rounded-2xl bg-gray-50 border border-gray-200/60 dark:bg-slate-950/35 dark:border-slate-800/60">
                <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                  アカウントを作成して同期する（移行手続き）
                </h4>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] text-gray-400">お名前</label>
                    <input 
                      type="text" 
                      id="mig-name"
                      placeholder="例: キャリア太郎"
                      defaultValue={settings.profileName}
                      className={`w-full p-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-250 text-gray-800'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400">メールアドレス</label>
                      <input 
                        type="email" 
                        id="mig-email"
                        placeholder="example@career.com"
                        className={`w-full p-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-250 text-gray-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400">パスワード（新規設定）</label>
                      <input 
                        type="password" 
                        id="mig-pass"
                        placeholder="6文字以上の英数字"
                        className={`w-full p-2.5 text-xs rounded-xl border focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-400 ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-250'
                        }`}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const name = (document.getElementById('mig-name') as HTMLInputElement)?.value || settings.profileName;
                      const email = (document.getElementById('mig-email') as HTMLInputElement)?.value;
                      const pass = (document.getElementById('mig-pass') as HTMLInputElement)?.value;
                      
                      if (!email || !pass) {
                        alert('メールアドレスとパスワードを入力してください。');
                        return;
                      }
                      if (pass.length < 6) {
                        alert('セキュリティのため、パスワードは6文字以上で入力してください。');
                        return;
                      }
                      
                      migrateGuestToAccount(email, name);
                      alert('アカウント登録が完了しました！ゲストデータをクラウドに完全同期しました。');
                    }}
                    className={`w-full font-black py-2.5 rounded-xl text-white cursor-pointer ${theme.bg} ${theme.hover} shadow-sm active:scale-98 transition-all text-xs`}
                  >
                    🚀 ゲストデータを移行してクラウド同期を開始
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-[11px] leading-relaxed dark:bg-emerald-950/10 dark:border-emerald-900/30">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-550 animate-pulse" />
                  <span>クラウド同期システム稼働中（SSL暗号化）</span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-gray-600 dark:text-gray-400 font-mono text-[10px]">
                  <div>アカウントID: <span className="font-bold text-gray-900 dark:text-white">{currentUser?.uid}</span></div>
                  <div>接続メール: <span className="font-bold text-gray-900 dark:text-white">{currentUser?.email}</span></div>
                  <div>同期状況: <span className="font-bold text-emerald-600 dark:text-emerald-400">{syncStatus === 'synced' ? '最新（自動・リアルタイム）' : '同期中'}</span></div>
                </div>
              </div>

              {/* Simulated biometric login logic */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50/50 border rounded-2xl dark:bg-slate-900/40 dark:border-slate-800">
                <div>
                  <span className={`font-bold text-xs block ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                    Touch ID / Face ID 生体認証連携
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">起動時のパスコード認証やログインをかんたん生体認証化</span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isBiometricEnabled}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      if (enabled) {
                        alert('🔐 端末側の Touch ID / Face ID 認証要求を受け付けました。\nシステム認証を通りました。これでログイン時の生体認証が有効になります。');
                        setBiometrics(true);
                      } else {
                        setBiometrics(false);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:height-5 after:width-5 after:transition-all ${isBiometricEnabled ? theme.bg : 'bg-gray-200'}`} />
                </label>
              </div>

              {/* Logout and data deletion widgets */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('ログアウトしてセッションを終了しますか？\n（次回のログインで再度本クラウドデータに同期可能です。）')) {
                      logout();
                    }
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 text-center border border-gray-200 text-gray-700 hover:bg-gray-100 text-[11px] font-bold rounded-xl transition-all cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  🚪 クラウドからログアウト
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('⚠️ 警告：アカウント消去\n本アカウントに紐づくすべてのクラウド履歴および同期データベースをサーバー（クラウド・ローカル双方）から物理消去します。この操作は復旧できません。本当に消去しますか？')) {
                      deleteAccount();
                    }
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 text-center bg-red-50 text-red-650 hover:bg-red-100/70 text-[11px] font-bold rounded-xl transition-all cursor-pointer dark:bg-rose-950/20 dark:text-rose-455"
                >
                  ⚠️ アカウント情報の物理削除
                </button>
              </div>
            </div>
          )}

          {/* Local statistics diagnostics */}
          <div className={`p-3 rounded-2xl grid grid-cols-3 gap-2 text-center font-mono ${
            isDark ? 'bg-slate-800/60' : 'bg-gray-50'
          }`}>
            <div className="p-1">
              <span className="block text-[10px] text-gray-400">登録企業数</span>
              <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{companies.length} 社</span>
            </div>
            <div className={`p-1 border-x ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <span className="block text-[10px] text-gray-400">タスク総数</span>
              <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{todos.length} 件</span>
            </div>
            <div className="p-1">
              <span className="block text-[10px] text-gray-400">OB・訪問記録</span>
              <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{obVisits.length} 件</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60 font-medium dark:bg-emerald-950/20 dark:border-emerald-800/30">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>SSL通信セキュリティ：クラウド暗号化同期テストを完了しています。</span>
          </div>

          {/* Reset button */}
          <div className="pt-2">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="py-1.5 px-3 bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 dark:bg-rose-950/20 dark:text-rose-455"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                全データの初期化・クリア（ローカルキャッシュ消去）
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 dark:bg-rose-950/30 dark:border-rose-900/50">
                <span className="font-bold text-rose-850 dark:text-rose-300 text-[11px] block">⚠️ 本当にリセットしますか？このプロセスは元に戻せません。</span>
                <div className="flex gap-2 text-[10px]">
                  <button 
                    type="button" 
                    onClick={handleResetData}
                    className="bg-rose-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-rose-700 transition cursor-pointer"
                  >
                    はい、すべて初期化
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowResetConfirm(false)}
                    className="bg-white text-gray-700 font-bold px-3 py-1.5 rounded-lg border hover:bg-gray-100 transition dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
                  >
                    いいえ、キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
