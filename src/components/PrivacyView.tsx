import React from 'react';
import { useApp } from '../context/AppContext';
import { getTheme } from '../utils/theme';
import { Shield, Lock, Eye, FileText, Scale } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyView() {
  const { settings, isDark } = useApp();
  const theme = getTheme(settings.themeColor);

  return (
    <div className="space-y-6 pb-20 text-left max-w-2xl mx-auto">
      <div>
        <h2 className={`text-xl font-black tracking-tight font-sans ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
          プライバシーポリシー
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">当アプリにおける情報の取り扱い、免責事項、著作権等に関する規定</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-3xl border shadow-xs space-y-6 leading-relaxed text-xs ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-gray-100 text-gray-650'
        }`}
      >
        {/* Section 1 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Shield className={`h-4.5 w-4.5 ${theme.text}`} />
            1. 個人情報の収集について
          </h3>
          <p>
            当アプリ「Berufly」では、ユーザー登録の際にお名前（ニックネーム）、メールアドレスを収集する場合があります。
            これらの個人情報は、ユーザーの認証、クラウドでのデータ同期、およびお問い合わせに対する回答や必要な情報を電子メール等でご連絡する場合にのみ利用し、目的外の利用は行いません。
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Eye className={`h-4.5 w-4.5 ${theme.text}`} />
            2. 広告の配信について
          </h3>
          <p>
            当アプリでは、第三者配信の広告サービス「Google AdSense」をはじめとする広告ネットワークを利用し、広告を表示する予定、または現在表示しております。
          </p>
          <p className="pl-3 border-l-2 border-indigo-500">
            Googleなどの広告配信事業者は、ユーザーの興味に応じた適切な商品やサービスの広告を表示するため、Cookie（クッキー）を使用することがあります。
            Cookieを使用することにより、当アプリや他サイトへのアクセス情報に基づいたパーソナライズ広告の配信が可能になります。
          </p>
          <p>
            ユーザーは、Googleの「広告設定」にて、パーソナライズ広告を無効にすることができます。
            また、お使いのブラウザ設定よりCookieを無効化することも可能です。詳細な手順はお使いのブラウザの公式ヘルプをご参照ください。
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Lock className={`h-4.5 w-4.5 ${theme.text}`} />
            3. 個人情報の第三者提供について
          </h3>
          <p>
            収集した個人情報は適切に管理し、次のいずれかに該当する場合を除き、第三者に開示または提供することはありません。
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>本人の同意がある場合</li>
            <li>法令に基づき開示が必要となる場合</li>
            <li>不正行為やセキュリティ侵害等の調査・防止のために開示が必要な場合</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Scale className={`h-4.5 w-4.5 ${theme.text}`} />
            4. 免責事項
          </h3>
          <p>
            当アプリで提供している情報やコンテンツ、企業データ等は慎重に調査・作成しておりますが、その正確性、安全性、合法性を保証するものではありません。
            当アプリを利用したことによる、志望選考の結果や損害について、開発者および運営者は一切の責任を負いかねます。自己判断でのご利用をお願いいたします。
          </p>
          <p>
            また、当アプリからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <FileText className={`h-4.5 w-4.5 ${theme.text}`} />
            5. 著作権について
          </h3>
          <p>
            当アプリ内に掲載されているすべての文章、画像、デザイン、プログラム等の著作権は「Berufly」の運営者または正当な権利者に帰属します。
            これらについて、法律で認められた私的使用の範囲を超えて、無断で転載、複製、配布、改変を行う行為を一切禁止いたします。
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 border-b pb-2 ${isDark ? 'text-slate-100 border-slate-800' : 'text-gray-900 border-gray-100'}`}>
            <Scale className={`h-4.5 w-4.5 ${theme.text}`} />
            6. 本ポリシーの変更
          </h3>
          <p>
            当アプリは、個人情報保護に関する法令の改正や、アプリサービスの拡充等に伴い、本プライバシーポリシーの内容を事前の通知なく改定することがあります。
            改定後のポリシーは、当ページに掲載した時点より有効となります。
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-micro text-gray-400 dark:text-slate-500 font-sans flex justify-between">
          <span>改定日：2026年5月31日</span>
          <span>© 2026 Berufly</span>
        </div>
      </motion.div>
    </div>
  );
}
