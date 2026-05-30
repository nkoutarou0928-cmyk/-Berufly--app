/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MockCorporateInfo {
  name: string;
  kana: string;
  searchKeys: string[]; // for flexible search
  industry: string;
  headquarters: string;
  scale: string; // 大手・メガベンチャー・準大手・ベンチャーなど
  establishedYear: string;
  employeeCount: string;
  website: string;
}

export const MOCK_CORPORATE_DB: MockCorporateInfo[] = [
  {
    name: 'トヨタ自動車株式会社',
    kana: 'とよたじどうしゃ',
    searchKeys: ['トヨタ', 'toyota', 'トヨタ自動車'],
    industry: 'メーカー・自動車',
    headquarters: '愛知県豊田市トヨタ町1番地',
    scale: '大手企業',
    establishedYear: '1937年',
    employeeCount: '約375,000人 (連結)',
    website: 'https://global.toyota/jp/'
  },
  {
    name: 'ソニーグループ株式会社',
    kana: 'そにーぐるーぷ',
    searchKeys: ['ソニー', 'sony', 'ソニーグループ'],
    industry: '電気機器・家電・エンタメ',
    headquarters: '東京都港区港南1-7-1',
    scale: '大手企業',
    establishedYear: '1946年',
    employeeCount: '約113,000人 (連結)',
    website: 'https://www.sony.com/ja/'
  },
  {
    name: 'ソフトバンク株式会社',
    kana: 'そふとばんく',
    searchKeys: ['ソフトバンク', 'softbank', 'sb'],
    industry: '通信・IT・インターネット',
    headquarters: '東京都港区海岸1-7-1',
    scale: '大手企業 / メガベンチャー',
    establishedYear: '1986年',
    employeeCount: '約47,000人 (単体)',
    website: 'https://www.softbank.jp/'
  },
  {
    name: '株式会社ファーストリテイリング',
    kana: 'ふぁーすとりていりんぐ',
    searchKeys: ['ユニクロ', 'uniqlo', 'ファーストリテイリング', 'g.u.', 'ジーユー'],
    industry: '小売・アパレル',
    headquarters: '山口県山口市佐山717番地1',
    scale: '大手企業',
    establishedYear: '1963年',
    employeeCount: '約57,000人 (連結)',
    website: 'https://www.fastretailing.com/jp/'
  },
  {
    name: '株式会社リクルートホールディングス',
    kana: 'りくるーと',
    searchKeys: ['リクルート', 'recruit', 'リクナビ', 'リクルートキャリア'],
    industry: '人材・メディア・インターネット',
    headquarters: '東京都千代田区丸の内1-9-2',
    scale: '大手企業 / メガベンチャー',
    establishedYear: '1960年',
    employeeCount: '約45,000人 (連結)',
    website: 'https://recruit-holdings.com/ja/'
  },
  {
    name: '株式会社サイバーエージェント',
    kana: 'さいばーえーじぇんと',
    searchKeys: ['サイバー', 'cyberagent', 'ca', 'サイバーエージェント', 'アベマ'],
    industry: 'ネット広告・メディア・ゲーム',
    headquarters: '東京都渋谷区宇田川町40-1',
    scale: 'メガベンチャー',
    establishedYear: '1998年',
    employeeCount: '約7,000人 (単体)',
    website: 'https://www.cyberagent.co.jp/'
  },
  {
    name: '株式会社NTTデータ',
    kana: 'えぬてぃてぃでーた',
    searchKeys: ['nttデータ', 'nttdata', 'エヌティティデータ', 'ntt'],
    industry: 'IT・システムインテグレーター',
    headquarters: '東京都江東区豊洲3-3-3',
    scale: '大手企業',
    establishedYear: '1988年',
    employeeCount: '約140,000人 (連結)',
    website: 'https://www.nttdata.com/global/ja/'
  },
  {
    name: '株式会社キーエンス',
    kana: 'きーえんす',
    searchKeys: ['キーエンス', 'keyence'],
    industry: '精密機器・電子計測器',
    headquarters: '大阪府大阪市東淀川区東中島1-3-14',
    scale: '大手企業',
    establishedYear: '1974年',
    employeeCount: '約8,500人 (連結)',
    website: 'https://www.keyence.co.jp/'
  },
  {
    name: '三菱商事株式会社',
    kana: 'みつびししょうじ',
    searchKeys: ['三菱商事', 'mitsubishi', '総合商社'],
    industry: '総合商社',
    headquarters: '東京都千代田区丸の内2-3-1',
    scale: '大手企業',
    establishedYear: '1954年',
    employeeCount: '約80,000人 (連結)',
    website: 'https://www.mitsubishicorp.com/jp/ja/'
  },
  {
    name: '味の素株式会社',
    kana: 'あじのもと',
    searchKeys: ['味の素', 'ajinomoto'],
    industry: '食品・調味料',
    headquarters: '東京都中央区京橋1-15-1',
    scale: '大手企業',
    establishedYear: '1925年',
    employeeCount: '約32,000人 (連結)',
    website: 'https://www.ajinomoto.co.jp/'
  },
  {
    name: 'サントリーホールディングス株式会社',
    kana: 'さんとりー',
    searchKeys: ['サントリー', 'suntory'],
    industry: '飲料・食品・ビール・洋酒',
    headquarters: '大阪府大阪市北区堂島浜2-1-40',
    scale: '大手企業',
    establishedYear: '1921年',
    employeeCount: '約40,500人 (連結)',
    website: 'https://www.suntory.co.jp/'
  },
  {
    name: '株式会社メルカリ',
    kana: 'めるかり',
    searchKeys: ['メルカリ', 'mercari'],
    industry: 'IT・フリマアプリEC',
    headquarters: '東京都港区六本木6-10-1',
    scale: 'メガベンチャー',
    establishedYear: '2013年',
    employeeCount: '約2,200人',
    website: 'https://about.mercari.com/'
  },
  {
    name: '任天堂株式会社',
    kana: 'にんてんどう',
    searchKeys: ['任天堂', 'nintendo', 'ニンテンドー'],
    industry: 'ゲーム・玩具製造',
    headquarters: '京都府京都市南区上鳥羽鉾立町11-1',
    scale: '大手企業',
    establishedYear: '1947年 (創業1889年)',
    employeeCount: '約6,700人 (連結)',
    website: 'https://www.nintendo.co.jp/'
  },
  {
    name: '株式会社ニトリ',
    kana: 'にとり',
    searchKeys: ['ニトリ', 'nitori', 'おねだん以上'],
    industry: '家具・小売流通',
    headquarters: '札幌市北区新琴似7条1丁目2-39',
    scale: '大手企業',
    establishedYear: '1972年',
    employeeCount: '約13,000人 (連結)',
    website: 'https://www.nitori.co.jp/'
  },
  {
    name: '株式会社電通',
    kana: 'でんつう',
    searchKeys: ['電通', 'dentsu'],
    industry: '広告代理店・クリエイティブ',
    headquarters: '東京都港区東新橋1-8-1',
    scale: '大手企業',
    establishedYear: '1901年',
    employeeCount: '約64,000人 (グループ全体)',
    website: 'https://www.dentsu.co.jp/'
  },
  {
    name: '楽天グループ株式会社',
    kana: 'らくてん',
    searchKeys: ['楽天', 'rakuten', '楽天市場', '楽天モバイル'],
    industry: 'EC・IT・FinTech・通信',
    headquarters: '東京都世田谷区玉川1-14-1',
    scale: 'メガベンチャー / 大手企業',
    establishedYear: '1997年',
    employeeCount: '約28,000人 (連結)',
    website: 'https://corp.rakuten.co.jp/'
  },
  {
    name: 'スマートニュース株式会社',
    kana: 'すまーとにゅーす',
    searchKeys: ['スマートニュース', 'smartnews', 'スマニュー'],
    industry: 'IT・ニュースメディア',
    headquarters: '東京都渋谷区神宮前6-30-3',
    scale: 'スタートアップ / プレIPO',
    establishedYear: '2012年',
    employeeCount: '約500人',
    website: 'https://www.smartnews.com/ja/'
  },
  {
    name: '株式会社マクロミル',
    kana: 'まくろみる',
    searchKeys: ['マクロミル', 'macromill'],
    industry: 'マーケティング・リサーチ・データ',
    headquarters: '東京都港区港南2-16-1',
    scale: '準大手企業 / ITベンチャー',
    establishedYear: '2000年',
    employeeCount: '約2,400人 (連結)',
    website: 'https://www.macromill.com/'
  }
];

// Paste URL Analyzer Helper
export interface ParsedJobInfo {
  detectedCompanyName: string;
  industry: string;
  headquarters: string;
  scale: string;
  establishedYear: string;
  employeeCount: string;
  website: string;
}

export function parseJobBoardUrl(url: string): ParsedJobInfo | null {
  if (!url) return null;
  const lowercaseUrl = url.toLowerCase();

  // 1. Identify if it matches Mynavi, Rikunabi, etc.
  let isJobBoard = false;
  let jobBoardName = '';
  if (lowercaseUrl.includes('mynavi.jp')) {
    isJobBoard = true;
    jobBoardName = 'マイナビ';
  } else if (lowercaseUrl.includes('rikunabi.com')) {
    isJobBoard = true;
    jobBoardName = 'リクナビ';
  } else if (lowercaseUrl.includes('onecareer.jp')) {
    isJobBoard = true;
    jobBoardName = 'ワンキャリア';
  } else if (lowercaseUrl.includes('doda.jp')) {
    isJobBoard = true;
    jobBoardName = 'doda';
  } else if (lowercaseUrl.includes('indeed.com')) {
    isJobBoard = true;
    jobBoardName = 'Indeed';
  }

  if (!isJobBoard) {
    // Treat as general URL - return a basic template
    return {
      detectedCompanyName: '株式会社キャリアイノベーション',
      industry: 'IT・情報サービス',
      headquarters: '東京都渋谷区道玄坂2丁目',
      scale: 'ベンチャー企業',
      establishedYear: '2018年',
      employeeCount: '約120人',
      website: url.startsWith('http') ? url : `https://${url}`
    };
  }

  // 2. Try to guess which company from search terms or path values
  // A heuristic approach: look for company names inside the url path or query params
  for (const corp of MOCK_CORPORATE_DB) {
    for (const key of corp.searchKeys) {
      if (lowercaseUrl.includes(key.toLowerCase())) {
        return {
          detectedCompanyName: corp.name,
          industry: corp.industry,
          headquarters: corp.headquarters,
          scale: corp.scale,
          establishedYear: corp.establishedYear,
          employeeCount: corp.employeeCount,
          website: corp.website
        };
      }
    }
  }

  // 3. Fallback dynamically generated data tailored to the URL path or keywords detected in the URL
  let detectedCompanyName = '求人情報から抽出された企業';
  let industry = 'IT・コンサルティング';
  let headquarters = '東京都港区六本木';
  let scale = '準大手企業 / 有力ベンチャー';
  let establishedYear = '2012年';
  let employeeCount = '約450人';
  let website = 'https://www.example.com';

  if (lowercaseUrl.includes('tech') || lowercaseUrl.includes('engineer') || lowercaseUrl.includes('system') || lowercaseUrl.includes('app')) {
    detectedCompanyName = 'テックソリューションズ株式会社';
    industry = 'IT・システムデベロップメント';
    headquarters = '東京都千代田区麹町';
    scale = '急成長メガベンチャー';
    establishedYear = '2015年';
    employeeCount = '約1,200人';
    website = 'https://tech-solutions-mock.co.jp/';
  } else if (lowercaseUrl.includes('consult') || lowercaseUrl.includes('m&a') || lowercaseUrl.includes('finance')) {
    detectedCompanyName = 'アドバンス・コンサルティング・グループ';
    industry = '専門コンサル・金融サービス';
    headquarters = '東京都中央区日本橋';
    scale = '準大手コンサル会社';
    establishedYear = '2008年';
    employeeCount = '約850人';
    website = 'https://advance-consulting-mock.co.jp/';
  } else if (lowercaseUrl.includes('food') || lowercaseUrl.includes('drink') || lowercaseUrl.includes('kashi')) {
    detectedCompanyName = '和み野フードサービス株式会社';
    industry = '食品・飲料製造・流通';
    headquarters = '大阪市中央区城見';
    scale = '中堅食品メーカー';
    establishedYear = '1982年';
    employeeCount = '約2,300人';
    website = 'https://nagomino-food-mock.co.jp/';
  }

  return {
    detectedCompanyName,
    industry,
    headquarters,
    scale,
    establishedYear,
    employeeCount,
    website
  };
}
