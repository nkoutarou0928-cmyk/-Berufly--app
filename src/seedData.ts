/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Company, TodoItem, AppSettings, NotificationItem, ObVisit, OfferComparison, SelfAnalysis } from './types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'co-1',
    name: 'グローバルテック株式会社',
    industry: 'IT・ソフトウェア',
    preference: 5,
    status: 'selecting',
    selectionStage: 'interview_1',
    esDeadline: '2026-06-05',
    interviewDate: '2026-06-03',
    esMemos: [
      {
        id: 'es-1-1',
        question: '学生時代に最も力を入れたこと（ガクチカ）を教えてください。',
        answer: '大学3年時に立ち上げたWebアプリ開発サークルで、メンバー15名と協力し企業のLP開発案件を3件受注しました。チーム開発においてGitHubを用いたコードレビュー cultureを導入し、開発スピードを従来の1.5倍に向上させました。この経験から、技術を課題解決に活かす面白さを学びました。',
        isDraft: false,
        category: 'gakuchika',
        minChars: 300,
        maxChars: 400,
        status: 'completed'
      },
      {
        id: 'es-1-2',
        question: '志望動機と弊社で挑戦したい仕事は何ですか？',
        answer: '最先端の生成AIを活用したSaaSプロダクトの開発に関わり、企業の生産性向上を支援したいからです。貴社はエンジニアの裁量が大きく、モダンな開発環境が整っている点に非常に魅力を感じています。まずはフロントエンドエンジニアとして貢献し、将来的にはフルスタックエンジニアとしてプロダクトを牽引したいです。',
        isDraft: true,
        category: 'motivation',
        minChars: 300,
        maxChars: 400,
        status: 'drafting'
      }
    ],
    interviewMemos: [
      {
        id: 'im-1-1',
        date: '2026-05-20',
        stageName: '書類通過面談',
        format: 'individual',
        questionsAndAnswers: [
          { q: 'サークルでの役割を教えてください。', a: '代表兼技術リードを務め、未経験メンバーへのメンターシップや設計の決定を行いました。' },
          { q: '挫折した経験とそれをどう乗り越えましたか？', a: '開発納期直前にバグが多発した際、個人のタスクを一時ストップし全員でデバッグ会を開くよう体制を組み直した結果、納期を厳守できました。' }
        ],
        reflections: '緊張したが、自身の具体的なエピソードを盛り込み、論理的に話すことができたのは高評価だったと思う。技術に対する熱意も十分伝わった。',
        improvements: '時折、早口になってしまう場面があったので、相手の反応を伺いながら一呼吸置いて話すことを意識したい。',
        nextPrep: '次回はいよいよ一次面接。より深掘りされる想定のため、プロダクトの仕様チェックと競合他社（テックスター社など）との比較、技術的質問（ReactやTypeScriptの選定理由など）に対する回答を用意する。'
      }
    ],
    notes: 'オフィスの雰囲気がとてもモダンで明るい。エンジニアブログを頻繁に更新しており、技術へのこだわりが強そう。',
    selectionType: 'main',
    internSteps: []
  },
  {
    id: 'co-2',
    name: 'フロンティア食品株式会社',
    industry: '食品・メーカー',
    preference: 4,
    status: 'es_submitted',
    selectionStage: 'applied',
    esDeadline: '2026-06-01',
    interviewDate: '',
    esMemos: [
      {
        id: 'es-2-1',
        question: 'あなたの「食」に対するこだわりや熱意を自由に語ってください。',
        answer: '私は「食を通じた健康と楽しさの提供」を追求したいと考えています。学生時代、栄養学の自主勉強をしつつ、健康惣菜を開発・SNS発信する活動を行っていました。素材にこだわり美味しく習慣化できる製品を世の中に届けることが私の夢です。',
        isDraft: false,
        category: 'other',
        minChars: 200,
        maxChars: 300,
        status: 'completed'
      }
    ],
    interviewMemos: [],
    notes: 'インターンに参加した際、人事の雰囲気が非常に温かかった。福利厚生が充実している。',
    selectionType: 'main',
    internSteps: []
  },
  {
    id: 'co-3',
    name: 'みらいコンサルティンググループ',
    industry: 'コンサルティング',
    preference: 5,
    status: 'offered',
    selectionStage: 'offered',
    esDeadline: '2026-04-15',
    interviewDate: '2026-05-18',
    esMemos: [
      {
        id: 'es-3-1',
        question: 'これまでの最大の課題、それに対する解決プロセスを教えてください。',
        answer: '飲食店でのアルバイトで、無駄な廃棄コストを30%削減した経験です。過去半年の売上と来店人数の変動データを分析し、天候や曜日ごとの発注量最適化モデルを作成しました。店舗での共有マニュアル化を行い仕組みとして定着させました。',
        isDraft: false,
        category: 'other',
        minChars: 300,
        maxChars: 400,
        status: 'completed'
      }
    ],
    interviewMemos: [
      {
        id: 'im-3-1',
        date: '2026-05-18',
        stageName: '最終面接',
        format: 'individual',
        questionsAndAnswers: [
          { q: 'なぜ他社ではなくみらいコンサルティングなのか？', a: '中小企業のDX支援に最も強みがあり、一貫して現場に寄り添ったハンズオン支援を提供している点に深く共感したためです。' },
          { q: 'キャリアパスのイメージは？', a: '最初の3年はITコンサルタントとして現場経験を積んだ後、5年以内にシニアコンサルタントとしてプロマネ業務を担当したいです。' }
        ],
        reflections: '最終面接らしく、意思決定力や適性を鋭く問われたが、一貫した論理で回答し通すことができた。その日の夕方に内定の電話！',
        improvements: '少し真面目すぎる表情だったかもしれない。もう少し笑顔があっても良かった。',
        nextPrep: '内定通知書を確認の上、労働条件の比較と、内定承諾期限の調整を行う。'
      }
    ],
    notes: '初任給が高く、評価制度が成果主義で明確。早期成長環境としては最適。',
    selectionType: 'main',
    internSteps: []
  },
  {
    id: 'co-4',
    name: '大和マテリアル株式会社',
    industry: '化学・素材',
    preference: 3,
    status: 'es_planned',
    selectionStage: 'none',
    esDeadline: '2026-06-12',
    interviewDate: '',
    esMemos: [],
    interviewMemos: [],
    notes: 'BtoBのニッチトップシェア企業。経営が安定している。',
    selectionType: 'main',
    internSteps: []
  },
  {
    id: 'co-5',
    name: 'アジアパートナーズ証券',
    industry: '金融・証券',
    preference: 3,
    status: 'rejected',
    selectionStage: 'interview_2',
    esDeadline: '2026-05-01',
    interviewDate: '2026-05-15',
    esMemos: [],
    interviewMemos: [
      {
        id: 'im-5-1',
        date: '2026-05-15',
        stageName: '二次面接',
        format: 'group',
        questionsAndAnswers: [
          { q: '証券営業に必要な資質とは何だと思いますか？', a: '顧客の潜在的ニーズを深く聞き出す「能動的ヒアリング能力」と、困難な目標に対してもブレずにやり遂げる「タフネス」です。' }
        ],
        reflections: 'グループ面接で他の受験者のエピソードが非常に強力で、少し気後れしてしまった。自分の魅力を簡潔に語る時間配分がうまくできなかった。',
        improvements: '他人の話を聞くときに自分のアピールばかり考えてしまい、笑顔を忘れていた。会話のラリーを意識すべき。',
        nextPrep: '残念ながらお祈り（不合格）。切り替えて、次の化学・メーカー系やIT業界の準備へ全力を尽くす。この反省をガクチカの話法に活かす。'
      }
    ],
    notes: '営業意欲、成果主義を重視するカルチャー。',
    selectionType: 'main',
    internSteps: []
  },
  {
    id: 'co-intern-1',
    name: 'フューチャーネットワークス株式会社',
    industry: '通信・ITインフラ',
    preference: 4,
    status: 'interested',
    selectionStatusIntern: 'selecting',
    selectionStage: 'none',
    esDeadline: '2026-06-10',
    interviewDate: '2026-06-05',
    esMemos: [
      {
        id: 'es-intern-1-1',
        question: 'あなたが今回の3daysインターンに参加する目的を具体的に教えてください。',
        answer: 'ネットワークエンジニアの最前線で使われている自動化技術（AnsibleやPythonによる構成管理）を、業界最先端の現役エンジニアの方々の直接指導のもとで実践的に学びたいと考え、本インターンシップに応募いたしました。大規模インフラを支えるやりがいと最新トレンドを体感することで、今後の研究活動やキャリアプランの構築へと繋げたいです。',
        isDraft: false,
        category: 'motivation',
        minChars: 200,
        maxChars: 400,
        status: 'completed'
      }
    ],
    interviewMemos: [],
    notes: '3daysの実践的な技術インターン。優秀者には本選考優遇ルート特典ありとの評判。',
    selectionType: 'intern',
    internType: 'multi_day',
    internSteps: [
      {
        id: 'step-i1-1',
        stepName: 'ES選考・適性検査',
        date: '2026-05-18',
        result: 'passed',
        notes: '自己PR・ガクチカ・モチベーションの軸を一貫させて回答。適性検査も問題なく通過。'
      },
      {
        id: 'step-i1-2',
        stepName: '一次オンライン面接',
        date: '2026-05-25',
        result: 'passed',
        notes: '面接官は現場リーダー。サークルでのLP開発経験について、技術選定の意図をわかりやすく説明したのが好印象だった。'
      },
      {
        id: 'step-i1-3',
        stepName: 'インターン本番（3Days）',
        date: '2026-06-05',
        result: 'selecting',
        notes: '本番はオンライン＆オフラインのハイブリット形式。自動化スクリプトの実機テストを予定。'
      }
    ]
  },
  {
    id: 'co-intern-2',
    name: 'メガクリエイトデザイン',
    industry: '広告・デザイン',
    preference: 3,
    status: 'interested',
    selectionStatusIntern: 'entry_done',
    selectionStage: 'none',
    esDeadline: '2026-06-20',
    interviewDate: '',
    esMemos: [],
    interviewMemos: [],
    notes: '1dayの夏インターン。会社の歴史とデザイナーワークショップを体験できる。',
    selectionType: 'intern',
    internType: '1day',
    internSteps: []
  }
];

export const INITIAL_TODOS: TodoItem[] = [
  // Today's Todo
  { id: 'todo-1', title: 'グローバルテックの志望動機推敲', completed: false, scope: 'today', dueDate: '2026-05-29' },
  { id: 'todo-2', title: '履歴書用の写真撮影予約', completed: true, scope: 'today', dueDate: '2026-05-29' },
  // Weekly Todo
  { id: 'todo-3', title: 'フロンティア食品のES推敲と提出', completed: false, scope: 'weekly', dueDate: '2026-05-31' },
  { id: 'todo-4', title: 'OB訪問の事前質問リスト作成', completed: true, scope: 'weekly', dueDate: '2026-05-30' },
  { id: 'todo-5', title: '業界分析ノート（IT業界）の整理', completed: true, scope: 'weekly', dueDate: '2026-05-28' },
  // Monthly Todo
  { id: 'todo-6', title: 'SPI参考書の非言語分野を読了', completed: false, scope: 'monthly', dueDate: '2026-06-15' },
  { id: 'todo-7', title: '自己分析のアップデート（モチベーショングラフ作成）', completed: true, scope: 'monthly', dueDate: '2026-05-25' },
  { id: 'todo-8', title: '逆質問リストの作成・精査（計20個）', completed: false, scope: 'monthly', dueDate: '2026-06-10' },
  // Goal
  {
    id: 'todo-9',
    title: '志望企業のESを累計10社以上提出する',
    completed: false,
    scope: 'goal',
    subtasks: [
      { id: 'st-1', title: '自己PR・ガクチカの共通フレームワーク化', completed: true },
      { id: 'st-2', title: 'IT業界：選定3社へ提出する', completed: true },
      { id: 'st-3', title: '食品業界：選定2社へ提出する', completed: false },
      { id: 'st-4', title: 'メーカー・素材業界：選定2社へ提出する', completed: false },
      { id: 'st-5', title: 'コンサル業界：選定3社へ提出する', completed: true }
    ]
  },
  {
    id: 'todo-10',
    title: '面接の実践慣れ・振り返りの型化',
    completed: false,
    scope: 'goal',
    subtasks: [
      { id: 'st-6', title: '逆質問を3つの切り口（事業・制度・文化）に分類準備', completed: true },
      { id: 'st-7', title: '1分間で簡潔に自己紹介するロープレ練習', completed: true },
      { id: 'st-8', title: '自身の面接映像を録画して話し方の癖を分析', completed: false }
    ]
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  themeColor: 'indigo', // Indigo(デフォルト)
  notificationsEnabled: true,
  notificationDaysBefore: 3,
  notificationTime: '09:00',
  themeMode: 'light',
  profileName: '就活チャレンジャー',
  profileAvatar: 'preset-1',
  profileMemo: '絶対内定！焦らず自分らしく。',
  shukatsuStartDate: '2026-04-01',
  geminiApiKey: ''
};

export const INITIAL_OB_VISITS: ObVisit[] = [
  {
    id: 'ob-1',
    companyId: 'co-1',
    visitDate: '2026-05-12',
    alumniName: '佐藤 翔太',
    department: '新規事業開発部 (2021年新卒入社)',
    notes: '若手のうちからプロジェクトを持たせてくれる環境で、主体性が強く求められるとのこと。面接では「自分がリーダーシップをとったこと」に加えて「周囲を巻き込んだ際の課題解決」について具体的に話すとウケが良いというアドバイスを受けた。'
  }
];

export const INITIAL_OFFER_COMPARISONS: OfferComparison[] = [
  {
    id: 'comp-1',
    companyId: 'co-3',
    baseSalary: 280000,
    benefits: '家賃補助(上限3万円/月), 書籍購入費全額支給, 副業支援制度あり',
    role: 'ITコンサルティング部門 総合職',
    commuteTime: '約25分（リモート併用、週3日出社）',
    pros: '初任給が高く、実力主義で成長スピードが圧倒的に早い。優秀な先輩が揃っており切磋琢磨できる。',
    cons: '繁忙期はかなり残業が増えることがある。プレッシャーはある程度高め。',
    rank: 1
  }
];

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

