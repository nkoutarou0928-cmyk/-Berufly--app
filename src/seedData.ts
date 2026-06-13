/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, TodoItem, AppSettings, NotificationItem, ObVisit, OfferComparison, SelfAnalysis } from './types';

export const INITIAL_COMPANIES: Company[] = [];

export const INITIAL_TODOS: TodoItem[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  themeColor: 'indigo', // Indigo(デフォルト)
  notificationsEnabled: true,
  notificationDaysBefore: 3,
  notificationTime: '09:00',
  themeMode: 'light'
};

export const INITIAL_OB_VISITS: ObVisit[] = [];

export const INITIAL_OFFER_COMPARISONS: OfferComparison[] = [];

export const INITIAL_SELF_ANALYSIS: SelfAnalysis = {
  selfPR: '私の強みは「周囲の対立を解消し、共通の目標へ導く合意形成力」です。サークル活動で運営方針の対立が生じた際、個別ヒアリングを行い、全員が納得できる折衷案を提示して活動を円滑に進めました。社会でもこの強みを活かし、多様な利害関係者と連携しプロジェクトを成功へ導きます。',
  gakuchika: '学生時代は「異文化インターンシップの誘致活動」に注力しました。当初は海外学生の受入先開拓が難航しましたが、企業ごとの採用課題（グローバル化ニーズ等）を徹底調査し、オーダーメイドのインターンシッププランを提案。結果として新たに4社からの受入合意を獲得し、前年比2倍の派遣実績を創出しました。',
  baseMotivations: [
    {
      id: 'bm-1',
      industry: 'IT・ソフトウェア',
      occupation: 'システムコンサルタント・SE',
      content: 'テクノロジーを用いて企業の非効率を解消し、より本質的なクリエイティブ活動に集中できる社会を実現したいからです。インターンでの業務改善システム開発を通じて、自身の提案が目の前のユーザーの笑顔に直接繋がる瞬間に深いやりがいを感じ、これを一生の仕事にしたいと強く志望するようになりました。'
    },
    {
      id: 'bm-2',
      industry: 'コンサルティング・調査',
      occupation: '経営コンサルタント',
      content: 'クライアント企業の成長を一番近くで伴走支援し、「なくてはならないパートナー」として貢献したいからです。サークル運営における課題解決で得た「相手の真のニーズを汲み取り言語化するスキル」を武器に、多角的なデータ分析と真摯な対話を通じて企業の根本的な課題解決に貢献したいと考えています。'
    }
  ],
  faqs: [
    {
      id: 'faq-1',
      question: 'あなたの「最大の強み」と、それを裏付けるビジネスシーンに役立つエピソードを教えてください。',
      answer: '最大の強みは、逆境でも物事を前に進める「主体的な行動力」です。イベントの集客に失敗した際、ただ嘆くのではなく、データ分析をもとに告知チャネルをデジタル中心へ即座にシフト。自ら広報画像や動画を15パターン作成し、SNS広告運用を主導することで一週間で目標PVを達成し盛況に繋げました。'
    },
    {
      id: 'faq-2',
      question: 'これまでに最も大きな「挫折経験」と、それをどのように乗り越えたか教えてください。',
      answer: '大学2年時、自ら主催したプログラミングワークショップに誰も参加者が来なかった経験です。大きな挫折感がありましたが、「ニーズへの理解不足」が原因であると考え、後輩たち約50名にアンケート調査を実施。その情報に基づき、「ゲーム開発で学ぶ基礎」として難易度を下げて再設計し、次回は20名満席での開催を達成しました。'
    }
  ]
};

