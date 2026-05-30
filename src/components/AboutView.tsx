import React from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Info, HelpCircle, CheckCircle, Sparkles, Building2, Calendar, ShieldCheck, Heart, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutView() {
  const { settings, isDark } = useApp();
  const theme = getTheme(settings.themeColor);

  return (
    <div className="space-y-6 pb-20 text-left max-w-2xl mx-auto">
      <div>
        <h2 className={`text-xl font-black tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          CareerNavi について
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">就活一元管理アプリ「CareerNavi」の開発目的、機能紹介、およびメリットについて</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl border shadow-xs space-y-6 leading-relaxed text-xs ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-gray-100 text-gray-650'
        }`}
      >
        {/* Purpose */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <HelpCircle className={`h-4.5 w-4.5 ${theme.text}`} />
            1. アプリの開発目的・理念
          </h3>
          <p>
            日本の就職活動は、数十社にのぼる企業へのエントリー、複数段階の面接スケジュール調整、それぞれの企業にあわせた志望動機やエントリーシート（ES）の作成、さらには自己分析やWebテスト対策など、極めて複雑でマルチタスクな進行管理が求められます。
          </p>
          <p>
            多くの就活生が「ESの提出期限をうっかり忘れてしまった」「面接スケジュールが重なってしまった」「過去にどの企業でどんな志望動機を話したか混乱してしまった」といった進行管理ミスや情報散乱に直面しています。
          </p>
          <p>
            「CareerNavi」は、そうした就活生の悩みを解決し、**「就活の進行管理と情報蓄積を一つのダッシュボードで完結させること」**を目的に開発されました。私たちは、就活生が管理作業の負担から解放され、自己分析や面接の準備といった本質的な選考対策に集中できる環境を提供することを目指しています。
          </p>
        </section>

        {/* Major Features */}
        <section className="space-y-3">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Sparkles className={`h-4.5 w-4.5 ${theme.text}`} />
            2. 主な機能と使い方
          </h3>
          <p>
            CareerNaviには、就活を一元管理するための多角的な機能が搭載されています。
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Building2 className={`h-4 w-4 ${theme.text}`} />
                <span>超高速の企業検索マスタ</span>
              </div>
              <p className="text-[10px] text-gray-500">
                日経有名企業300社、外資有名企業100社のデータをアプリ内にローカル内蔵。キーワードを入力するだけで、本社所在地、ホームページURL、従業員規模などのメタデータを含んだ企業カードを瞬時に自動登録できます。
              </p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Calendar className={`h-4 w-4 ${theme.text}`} />
                <span>選考フェーズ・カレンダー管理</span>
              </div>
              <p className="text-[10px] text-gray-500">
                「興味あり」「ES提出予定」「選考中」「内定」などの選考ステータスをリアルタイムで分類・可視化。締切日や面接予定日は専用のカレンダー画面と連動し、直感的に活動予定を俯瞰できます。
              </p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <FileText className={`h-4 w-4 ${theme.text}`} />
                <span>ES・面接の振り返りメモ</span>
              </div>
              <p className="text-[10px] text-gray-500">
                企業ごとに「志望動機・自己PRなどのES記述の下書き」や「面接で聞かれた質問と回答・改善点の振り返り」を紐づけて記録。選考が進むにつれ、あなただけの選考ノウハウが蓄積されます。
              </p>
            </div>

            <div className={`p-3 rounded-2xl border ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-gray-100'}`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <ShieldCheck className={`h-4 w-4 ${theme.text}`} />
                <span>端末間同期とPWA対応</span>
              </div>
              <p className="text-[10px] text-gray-500">
                クラウドでのデータ同期をサポート。メールアドレス登録を行うだけで、スマートフォンとPCの両方から同一のデータを閲覧・編集可能です。さらに、PWAに対応しており、アプリのようにホーム画面に追加して快適に使えます。
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <CheckCircle className={`h-4.5 w-4.5 ${theme.text}`} />
            3. 就活生にとっての3大メリット
          </h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <span className="font-bold text-gray-800 dark:text-slate-200">機会損失（ES締切・面接忘れ）の完全ゼロ化</span>
              <p className="text-[10.5px] mt-0.5">締切期日が迫ったタスクや選考情報をアプリがリアルタイムに警告通知するため、意図しないエントリー漏れを防ぎ、チャンスを逃しません。</p>
            </li>
            <li>
              <span className="font-bold text-gray-800 dark:text-slate-200">過去の面接対策・ESの再利用が簡単</span>
              <p className="text-[10.5px] mt-0.5">他社で評価された自己PRや自己分析ノートをすぐにコピペ・確認できるため、選考が進めば進むほど選考書類の作成スピードと通過クオリティが高まります。</p>
            </li>
            <li>
              <span className="font-bold text-gray-800 dark:text-slate-200">思考を整理し、軸のブレない就活を実現</span>
              <p className="text-[10.5px] mt-0.5">「自己分析」タブでいつでも就活の軸や原動力を整理・確認でき、複数企業からのオファー（内定）獲得時に迷わないための条件比較マトリクス機能も搭載しています。</p>
            </li>
          </ol>
        </section>

        {/* Closing / Dedication */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Heart className={`h-4.5 w-4.5 ${theme.text}`} />
            おわりに
          </h3>
          <p>
            就職活動は、自身の人生における大きな転換点であり、多くの課題や不安に立ち向かう旅でもあります。
            私たちは、CareerNaviがあなたのパートナーとなり、就職活動という重要な挑戦を強力に支えることができる存在になることを心より祈っております。
          </p>
        </section>
      </motion.div>
    </div>
  );
}
