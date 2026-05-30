import React, { useEffect, useState } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const { settings, isDark } = useApp();
  const theme = getTheme(settings.themeColor);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 既にスタンドアロン（ホーム画面から起動）として動作している場合は表示しない
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone) {
      return;
    }

    // iOS判定
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Android/Chromeなどのインストールプロンプト用イベントリスナー
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // インストール可能になったらプロンプトを表示
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safariの場合は、初回起動時や定期的にインストール方法のバナーを優しく提示
    if (ios) {
      const hasDismissedIOSPrompt = localStorage.getItem('pwa_ios_prompt_dismissed');
      if (!hasDismissedIOSPrompt) {
        // 少し時間をおいてから表示（ユーザー体験の向上のため）
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Android/Chromeのインストールダイアログを表示
    await deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      console.log('ユーザーがPWAインストールを承諾しました');
      setShowPrompt(false);
    } else {
      console.log('ユーザーがPWAインストールをキャンセルしました');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      // iOSの場合は一度閉じたら再度表示しないようにストレージに保存
      localStorage.setItem('pwa_ios_prompt_dismissed', 'true');
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 w-[calc(100%-24px)] max-w-md z-50 p-4 border rounded-2xl shadow-xl transition-all ${isDark
            ? 'bg-slate-900/95 border-slate-800 text-slate-100'
            : 'bg-white/95 border-gray-200 text-gray-900'
            } backdrop-blur-md`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-lg shadow-sm shrink-0">
              C
            </div>

            <div className="flex-1 text-left">
              <h4 className="text-xs font-bold font-sans">CareerNavi+ をホーム画面に追加</h4>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                {isIOS ? (
                  <span className="flex flex-col gap-1">
                    <span>iPhone (Safari)でインストールして快適に使う：</span>
                    <span className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400">
                      1. 下部の共有ボタン <Share className="h-3.5 w-3.5 inline" /> をタップ
                    </span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      2. 「ホーム画面に追加」をタップ
                    </span>
                  </span>
                ) : (
                  'ホーム画面に追加すると、Webブラウザのアドレスバーなしで、ネイティブアプリのように素早く快適に就活管理が行えます。'
                )}
              </p>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!isIOS && deferredPrompt && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleInstallClick}
                className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition active:scale-98 ${theme.bg} ${theme.hover} flex items-center justify-center gap-1.5`}
              >
                <Download className="h-3.5 w-3.5" />
                ホーム画面にCareerNaviを追加
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-3 border border-gray-250 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-850 transition"
              >
                後で
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
