import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Mail, User, BookOpen, MessageSquare, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ContactView() {
  const { settings, isDark } = useApp();
  const theme = getTheme(settings.themeColor);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      alert('すべての入力必須項目を入力してください。');
      return;
    }

    setIsSending(true);

    // Simulate send round-trip latency
    setTimeout(() => {
      setIsSending(false);
      setShowToast(true);
      
      // Clear fields
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');

      // Auto dismiss toast after 4 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-20 text-left max-w-md mx-auto relative">
      {/* Dynamic Alert Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm bg-emerald-600 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 border border-emerald-500"
          >
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div className="text-left flex-1">
              <span className="block text-xs font-black">送信が完了しました（デモ）</span>
              <span className="text-[10px] text-emerald-100 block mt-0.5">
                お問い合わせを受け付けました。ご入力ありがとうございます。
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 className={`text-xl font-black tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          お問い合わせ
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">不具合のご報告、改善要望、その他のご連絡はこちらよりお送りください</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className={`p-5 rounded-3xl border shadow-xs space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'
        }`}
      >
        {/* Name input */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            お名前 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <User className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="キャリア 太郎"
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium' : 'bg-gray-50 border-gray-250 text-gray-800 font-medium'
              }`}
            />
          </div>
        </div>

        {/* Email input */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Mail className="h-4 w-4" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@career-navi.com"
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 font-mono ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-gray-50 border-gray-250 text-gray-800'
              }`}
            />
          </div>
        </div>

        {/* Subject input */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            件名 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <BookOpen className="h-4 w-4" />
            </span>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="不具合報告、要望、掲載について等"
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium' : 'bg-gray-50 border-gray-250 text-gray-800 font-medium'
              }`}
            />
          </div>
        </div>

        {/* Message body */}
        <div>
          <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 text-gray-400">
              <MessageSquare className="h-4 w-4" />
            </span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="詳細をご記入ください。"
              className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-${settings.themeColor}-450 leading-relaxed ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-100 font-medium' : 'bg-gray-50 border-gray-250 text-gray-800 font-medium'
              }`}
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSending}
          className={`w-full py-3.5 rounded-2xl text-xs font-black text-white transition-all shadow-md active:scale-97 cursor-pointer flex items-center justify-center gap-1.5 ${
            isSending ? 'opacity-50 cursor-not-allowed bg-gray-500' : `${theme.bg} ${theme.hover}`
          }`}
        >
          {isSending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>送信する</span>
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
