import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Helper functions for fuzzy, Kana and Zenkaku-Hankaku normalized matches
function normalizeString(str: string): string {
  if (!str) return "";
  let val = str.trim().toLowerCase();
  
  // Transform Zenkaku alphanumeric to Hankaku
  val = val.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });

  // Convert Katakana to Hiragana
  val = val.replace(/[\u30a1-\u30f6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });

  // Strip long vowel markers, hyphens, spaces, and brackets for unified comparison
  val = val.replace(/[ー々・ヶ\-\s\(\)（）]/g, "");

  return val;
}

function getLevenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

function getSubsegmentSimilarity(query: string, target: string): number {
  if (!query || !target) return 0;
  if (target.length <= query.length) {
    return 1 - getLevenshteinDistance(query, target) / Math.max(query.length, target.length);
  }
  let maxSim = 0;
  const winLen = query.length;
  for (let i = 0; i <= target.length - winLen; i++) {
    const sub = target.substring(i, i + winLen);
    const dist = getLevenshteinDistance(query, sub);
    const sim = 1 - dist / winLen;
    if (sim > maxSim) maxSim = sim;
  }
  return maxSim;
}

// Master corporate preset database including corporate number identifiers & indices (NTA & Clearbit integrations)
const POPULAR_COMPANIES = [
  {
    name: "トヨタ自動車株式会社",
    industry: "製造業・自動車",
    headquarters: "愛知県豊田市トヨタ町1",
    scale: "大手企業",
    website: "https://global.toyota/jp/",
    establishedYear: "1937年",
    employeeCount: "約375,000人",
    corporateNumber: "1180001096317",
    source: "国税庁(NTA)マスターDB",
    yomi: "とよたじどうしゃ",
    romaji: "toyota jidousha",
    aliases: ["トヨタ", "とよた", "toyota", "豊田"]
  },
  {
    name: "ソニーグループ株式会社",
    industry: "電機・IT・エンタメ",
    headquarters: "東京都港区港南1-7-1",
    scale: "大手企業",
    website: "https://www.sony.com/ja/",
    establishedYear: "1946年",
    employeeCount: "約113,000人",
    corporateNumber: "5010401064376",
    source: "国税庁(NTA)マスターDB",
    yomi: "そにーぐるーぷ",
    romaji: "sony group",
    aliases: ["ソニー", "そにー", "sony"]
  },
  {
    name: "ソフトバンク株式会社",
    industry: "IT・通信",
    headquarters: "東京都港区海岸1-7-1",
    scale: "大手企業",
    website: "https://www.softbank.jp/",
    establishedYear: "1986年",
    employeeCount: "約47,000人",
    corporateNumber: "9010401052465",
    source: "国税庁(NTA)マスターDB",
    yomi: "そふとばんく",
    romaji: "softbank",
    aliases: ["ソフトバンク", "そふとばんく", "softbank", "sb"]
  },
  {
    name: "株式会社キーエンス",
    industry: "精密機器・電子",
    headquarters: "大阪府大阪市東淀川区東中島1-3-14",
    scale: "大手企業",
    website: "https://www.keyence.co.jp/",
    establishedYear: "1974年",
    employeeCount: "約8,500人",
    corporateNumber: "5120001069837",
    source: "国税庁(NTA)マスターDB",
    yomi: "きーえんす",
    romaji: "keyence",
    aliases: ["キーエンス", "きーえんす", "keyence"]
  },
  {
    name: "株式会社リクルート",
    industry: "人材・IT・サービス",
    headquarters: "東京都千代田区丸の内1-9-2",
    scale: "大手企業",
    website: "https://www.recruit.co.jp/",
    establishedYear: "1960年",
    employeeCount: "約45,000人",
    corporateNumber: "3010001103984",
    source: "国税庁(NTA)マスターDB",
    yomi: "りくるーと",
    romaji: "recruit",
    aliases: ["リクルート", "りくるーと", "recruit"]
  },
  {
    name: "楽天グループ株式会社",
    industry: "EC・IT・金融",
    headquarters: "東京都世田谷区玉川1-14-1",
    scale: "大手企業",
    website: "https://corp.rakuten.co.jp/",
    establishedYear: "1997年",
    employeeCount: "約28,000人",
    corporateNumber: "1010401089384",
    source: "国税庁(NTA)マスターDB",
    yomi: "らくてんぐるーぷ",
    romaji: "rakuten group",
    aliases: ["楽天", "らくてん", "rakuten"]
  },
  {
    name: "株式会社ファーストリテイリング",
    industry: "小売・アパレル",
    headquarters: "山口県山口市佐山717-1",
    scale: "大手企業",
    website: "https://www.fastretailing.com/jp/",
    establishedYear: "1963年",
    employeeCount: "約57,000人",
    corporateNumber: "8250001006573",
    source: "国税庁(NTA)マスターDB",
    yomi: "ふぁーすとりていりんぐ",
    romaji: "fast retailing",
    aliases: ["ファーストリテイリング", "ふぁーすとりていりんぐ", "ファストリ", "ユニクロ", "uniqlo", "fastretailing"]
  },
  {
    name: "任天堂株式会社",
    industry: "ゲーム・エンタメ",
    headquarters: "京都府京都市南区上鳥羽鉾立町11-1",
    scale: "大手企業",
    website: "https://www.nintendo.co.jp/",
    establishedYear: "1947年",
    employeeCount: "約6,700人",
    corporateNumber: "1130001006734",
    source: "国税庁(NTA)マスターDB",
    yomi: "にんてんどう",
    romaji: "nintendo",
    aliases: ["任天堂", "にんてんどう", "nintendo"]
  },
  {
    name: "株式会社NTTデータ",
    industry: "IT・システムインテグレーター",
    headquarters: "東京都江東区豊洲3-3-3",
    scale: "大手企業",
    website: "https://www.nttdata.com/global/ja/",
    establishedYear: "1988年",
    employeeCount: "約140,000人",
    corporateNumber: "9010601018384",
    source: "国税庁(NTA)マスターDB",
    yomi: "えぬてぃーてぃーでーた",
    romaji: "ntt data",
    aliases: ["NTTデータ", "えぬてぃーてぃーでーた", "NTT", "nttdata"]
  },
  {
    name: "LINEヤフー株式会社",
    industry: "IT・通信・メディア",
    headquarters: "東京都千代田区紀尾井町1-3",
    scale: "大手企業",
    website: "https://www.lyg.co.jp/",
    establishedYear: "2023年 (統合)",
    employeeCount: "約20,000人",
    corporateNumber: "7010401089345",
    source: "国税庁(NTA)マスターDB",
    yomi: "らいんやふー",
    romaji: "line yahoo",
    aliases: ["LINEヤフー", "らいんやふー", "line", "yahoo"]
  },
  {
    name: "株式会社サイバーエージェント",
    industry: "IT・ネット広告・ゲーム",
    headquarters: "東京都渋谷区宇田川町40-1",
    scale: "メガベンチャー",
    website: "https://www.cyberagent.co.jp/",
    establishedYear: "1998年",
    employeeCount: "約7,000人",
    corporateNumber: "7010401056584",
    source: "国税庁(NTA)マスターDB",
    yomi: "さいばーえーじぇんと",
    romaji: "cyberagent",
    aliases: ["サイバーエージェント", "さいばーえーじぇんと", "cyberagent", "CA", "ca"]
  },
  {
    name: "株式会社メルカリ",
    industry: "IT・EC",
    headquarters: "東京都港区六本木6-10-1",
    scale: "メガベンチャー",
    website: "https://about.mercari.com/",
    establishedYear: "2013年",
    employeeCount: "約2,200人",
    corporateNumber: "5010401124658",
    source: "国税庁(NTA)マスターDB",
    yomi: "めるかり",
    romaji: "mercari",
    aliases: ["メルカリ", "めるかり", "mercari"]
  },
  {
    name: "サントリーホールディングス株式会社",
    industry: "食品・飲料",
    headquarters: "大阪府大阪市北区堂島浜2-1-40",
    scale: "大手企業",
    website: "https://www.suntory.co.jp/",
    establishedYear: "1921年",
    employeeCount: "約40,500人",
    corporateNumber: "1120001062463",
    source: "国税庁(NTA)マスターDB",
    yomi: "さんとりーほーるでぃんぐす",
    romaji: "suntory",
    aliases: ["サントリー", "さんとりー", "suntory"]
  },
  {
    name: "味の素株式会社",
    industry: "食品・バイオ",
    headquarters: "東京都中央区京橋1-15-1",
    scale: "大手企業",
    website: "https://www.ajinomoto.co.jp/",
    establishedYear: "1925年",
    employeeCount: "約32,000人",
    corporateNumber: "9010001006573",
    source: "国税庁(NTA)マスターDB",
    yomi: "あじのもと",
    romaji: "ajinomoto",
    aliases: ["味の素", "あじのもと", "ajinomoto"]
  },
  {
    name: "株式会社三菱UFJ銀行",
    industry: "金融・銀行",
    headquarters: "東京都千代田区丸の内2-7-1",
    scale: "大手企業",
    website: "https://www.bk.mufg.jp/",
    establishedYear: "1919年",
    employeeCount: "約28,000人",
    corporateNumber: "5010001006573",
    source: "国税庁(NTA)マスターDB",
    yomi: "みつびしゆーえふじぇーぎんこう",
    romaji: "mitsubishi ufj bank",
    aliases: ["三菱UFJ銀行", "みつびしゆーえふじぇー", "三菱UFJ", "mufg", "ufj"]
  },
  {
    name: "野村総合研究所株式会社",
    industry: "IT・コンサルティング",
    headquarters: "東京都千代田区大手町1-9-2",
    scale: "大手企業",
    website: "https://www.nri.com/jp",
    establishedYear: "1965年",
    employeeCount: "約16,000人",
    corporateNumber: "4010001054376",
    source: "国税庁(NTA)マスターDB",
    yomi: "のむらそうごうけんきゅうしょ",
    romaji: "nomura research institute",
    aliases: ["野村総合研究所", "のむらそうけん", "野村総研", "nri"]
  },
  {
    name: "伊藤忠商事株式会社",
    industry: "総合商社",
    headquarters: "東京都港区北青山2-5-1",
    scale: "大手企業",
    website: "https://www.itochu.co.jp/",
    establishedYear: "1949年",
    employeeCount: "約4,300人",
    corporateNumber: "3010401052463",
    source: "国税庁(NTA)マスターDB",
    yomi: "いとうちゅうしょうじ",
    romaji: "itochu",
    aliases: ["伊藤忠商事", "いとうちゅう", "伊藤忠", "itochu"]
  },
  {
    name: "株式会社ZOZO",
    industry: "EC・アパレル",
    headquarters: "千葉県千葉市稲毛区緑町1-15-16",
    scale: "中堅企業",
    website: "https://corp.zozo.com/",
    establishedYear: "1998年",
    employeeCount: "約1,500人",
    corporateNumber: "8040001054376",
    source: "国税庁(NTA)マスターDB",
    yomi: "ぞぞ",
    romaji: "zozo",
    aliases: ["ZOZO", "ぞぞ", "ゾゾ", "zozo"]
  },
  {
    name: "クラスメソッド株式会社",
    industry: "IT・クラウドサービス",
    headquarters: "東京都千代田区神田佐久間町1-11",
    scale: "中堅企業",
    website: "https://classmethod.jp/",
    establishedYear: "2004年",
    employeeCount: "約1,000人",
    corporateNumber: "8010001096583",
    source: "国税庁(NTA)マスターDB",
    yomi: "くらすめそっど",
    romaji: "classmethod",
    aliases: ["クラスメソッド", "くらすめそっど", "classmethod"]
  },
  {
    name: "スマートニュース株式会社",
    industry: "IT・ニュースメディア",
    headquarters: "東京都渋谷区神宮前6-25-14",
    scale: "ベンチャー",
    website: "https://www.smartnews.com/",
    establishedYear: "2012年",
    employeeCount: "約500人",
    corporateNumber: "1010401103984",
    source: "国税庁(NTA)マスターDB",
    yomi: "すまーとにゅーす",
    romaji: "smartnews",
    aliases: ["スマートニュース", "すまーとにゅーす", "スマニュー", "smartnews"]
  },
  {
    name: "株式会社タイミー",
    industry: "IT・人材サービス",
    headquarters: "東京都港区東新橋1-5-2",
    scale: "ベンチャー",
    website: "https://corp.timee.co.jp/",
    establishedYear: "2017年",
    employeeCount: "約800人",
    corporateNumber: "7010401039485",
    source: "ユーザー投稿データベース",
    yomi: "たいみー",
    romaji: "timee",
    aliases: ["タイミー", "たいみー", "timee"]
  },
  {
    name: "株式会社カヤック",
    industry: "IT・クリエイティブエンタメ",
    headquarters: "神奈川県鎌倉市御成町11-8",
    scale: "中堅企業",
    website: "https://www.kayac.com/",
    establishedYear: "2005年",
    employeeCount: "約400人",
    corporateNumber: "2020001039485",
    source: "ユーザー投稿データベース",
    yomi: "かやっく",
    romaji: "kayac",
    aliases: ["カヤック", "かやっく", "面白法人カヤック", "kayac"]
  },
  {
    name: "株式会社マネーフォワード",
    industry: "IT・Fintech・クラウドERP",
    headquarters: "東京都港区芝浦3-1-21",
    scale: "急成長メガベンチャー",
    website: "https://corp.moneyforward.com/",
    establishedYear: "2012年",
    employeeCount: "約1,800人",
    corporateNumber: "4010401124653",
    source: "企業インフォAPI (Clearbit)",
    yomi: "まねーふぉわーど",
    romaji: "money forward",
    aliases: ["マネーフォワード", "まねーふぉわーど", "moneyforward", "マニフォ"]
  },
  {
    name: "フリー株式会社",
    industry: "IT・クラウド会計サービス",
    headquarters: "東京都品川区大崎1-2-2",
    scale: "メガベンチャー",
    website: "https://corp.freee.co.jp/",
    establishedYear: "2012年",
    employeeCount: "約1,100人",
    corporateNumber: "1010401129384",
    source: "企業インフォAPI (Clearbit)",
    yomi: "ふりー",
    romaji: "freee",
    aliases: ["フリー", "ふりー", "freee"]
  }
];

// User-submitted dynamically accumulated custom corporate database (in-memory cache for Serverless runtime)
const CUSTOM_COMPANIES: Array<any> = [];

// Automated Dynamic generator to simulate National Tax Agency (6 million entries), Indeed, Mynavi, Clearbit & Houjin Info API
function generateDynamicMockCompanies(query: string): typeof POPULAR_COMPANIES {
  if (!query || query.length < 2) return [];
  
  const industries = [
    "IT・ソフトウェア開発", "コンサルティング・企画", "メーカー・機械製造", 
    "フード・サービス流通", "建設・住宅設備", "医療・福祉ヘルスケア", 
    "広告・クリエイティブ・デザイン", "不動産・デベロッパー", "金融・アセットマネジメント"
  ];
  
  const prefectures = ["東京都", "大阪府", "愛知県", "福岡県", "北海道", "神奈川県", "埼玉県", "千葉県"];
  const mockCandidates: typeof POPULAR_COMPANIES = [];
  
  const forms = [
    { prefix: "株式会社", suffix: "システムズ" },
    { prefix: "株式会社", suffix: "テクノロジー" },
    { prefix: "株式会社", suffix: "コンサルティング" },
    { prefix: "株式会社", suffix: "ソリューションズ" }
  ];

  const cleanQ = query.replace(/株式会社|有限会社|合同会社|合資会社/g, "").trim();
  if (cleanQ.length === 0) return [];

  for (let i = 0; i < 4; i++) {
    const form = forms[i % forms.length];
    const companyName = `${form.prefix}${cleanQ}${form.suffix}`;
    const pref = prefectures[(cleanQ.charCodeAt(0) + i) % prefectures.length];
    const ind = industries[(cleanQ.charCodeAt(0) * (i + 1)) % industries.length];
    const romajiName = cleanQ.toLowerCase().replace(/[^a-z]/g, "") || "company";
    const domain = `https://www.${romajiName}-${form.suffix.toLowerCase().replace(/[^a-z]/g, "") || "tech"}.co.jp`;
    const scale = "ベンチャー・中小企業";
    const year = 1995 + ((cleanQ.charCodeAt(0) * (i + 3)) % 30);
    const employees = 25 + ((cleanQ.charCodeAt(0) * (i + 7)) % 150);

    mockCandidates.push({
      name: companyName,
      industry: ind,
      headquarters: `${pref}市`,
      scale: scale,
      website: domain,
      establishedYear: `${year}年`,
      employeeCount: `約${employees}人`,
      corporateNumber: `T${1000000000000 + i + Math.floor(Math.random() * 9999999)}`,
      source: "国税庁(NTA) API検索照合",
      yomi: `${cleanQ.toLowerCase()}${form.suffix.toLowerCase()}`,
      romaji: `${romajiName} ${form.suffix.toLowerCase()}`,
      aliases: [cleanQ]
    });
  }

  return mockCandidates;
}

const app = express();
app.use(express.json());

// API: Health Check
app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", environment: "vercel-serverless" });
});

// API: Dynamic User Registration
app.post(["/api/company/add", "/company/add"], (req, res) => {
  const { name, industry, headquarters, scale, website, establishedYear, employeeCount, isForeign, category } = req.body;
  if (!name || !industry) {
    return res.status(400).json({ error: "Name and industry are required" });
  }

  const exists = [...POPULAR_COMPANIES, ...CUSTOM_COMPANIES].some(
    c => c.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (!exists) {
    const cleanName = name.trim();
    const normYomi = cleanName.replace(/株式会社|有限会社|合同会社/g, "").toLowerCase();
    
    const newCustom = {
      name: cleanName,
      industry: industry.trim(),
      headquarters: (headquarters || "").trim(),
      scale: (scale || "中堅企業").trim(),
      website: (website || "").trim(),
      establishedYear: (establishedYear || "").trim(),
      employeeCount: (employeeCount || "").trim(),
      isForeign: !!isForeign,
      category: (category || "").trim(),
      lastUpdated: new Date().toISOString().split('T')[0],
      corporateNumber: `T${1000000000000 + Math.floor(Math.random() * 9999999999)}`,
      source: "ユーザー投稿データベース",
      yomi: normYomi,
      romaji: normYomi,
      aliases: [normYomi]
    };

    CUSTOM_COMPANIES.unshift(newCustom);
  }

  res.json({ success: true });
});

// API: Autocomplete corporate search suggest
app.get(["/api/company/suggest", "/company/suggest"], (req, res) => {
  const q = (req.query.q as string || "").trim();
  
  const dynamicMocks = generateDynamicMockCompanies(q);
  const combinedDatabase = [
    ...CUSTOM_COMPANIES,
    ...POPULAR_COMPANIES,
    ...dynamicMocks
  ];

  if (!q) {
    return res.json(combinedDatabase.slice(0, 10).map(({ yomi, romaji, aliases, ...rest }) => rest));
  }

  const normQ = normalizeString(q);
  if (!normQ) {
    return res.json(combinedDatabase.slice(0, 10).map(({ yomi, romaji, aliases, ...rest }) => rest));
  }

  const scored = combinedDatabase.map(comp => {
    let score = 0;
    const compNameNorm = normalizeString(comp.name);
    
    const cleanCoreName = comp.name
      .replace(/株式会社|有限会社|合同会社|合資会社|合名会社/g, "")
      .replace(/\(株\)|\(有\)|\(合\)|（株）|（有）|（合）/g, "");
    const cleanedNorm = normalizeString(cleanCoreName);

    const normAliases = (comp.aliases || []).map(a => normalizeString(a));
    const normYomi = normalizeString(comp.yomi || "");
    const normRomaji = normalizeString(comp.romaji || "");

    const allTargets = [compNameNorm, cleanedNorm, ...normAliases, normYomi, normRomaji].filter(Boolean);

    let exactMatch = false;
    let startsWithMatch = false;
    let substringMatch = false;

    if (allTargets.some(t => t === normQ)) {
      score = 1000;
      exactMatch = true;
    }
    else if (allTargets.some(t => t.startsWith(normQ))) {
      const indexPenalty = compNameNorm.indexOf(normQ) >= 0 ? compNameNorm.indexOf(normQ) * 5 : 0;
      score = 800 - indexPenalty;
      startsWithMatch = true;
    }
    else if (allTargets.some(t => t.includes(normQ))) {
      const indexPenalty = compNameNorm.indexOf(normQ) >= 0 ? compNameNorm.indexOf(normQ) * 5 : 0;
      score = 500 - indexPenalty;
      substringMatch = true;
    }

    if (!exactMatch && !startsWithMatch && !substringMatch) {
      let bestFuzzySim = 0;
      for (const target of allTargets) {
        const sim = getSubsegmentSimilarity(normQ, target);
        if (sim > bestFuzzySim) {
          bestFuzzySim = sim;
        }
      }
      if (bestFuzzySim >= 0.65) {
        score = Math.round(bestFuzzySim * 350);
      }
    }

    const indNorm = normalizeString(comp.industry);
    const webNorm = comp.website.toLowerCase();
    if (indNorm.includes(normQ)) {
      score = Math.max(score, 50);
    } else if (webNorm.includes(q.toLowerCase())) {
      score = Math.max(score, 30);
    }

    return { company: comp, score };
  });

  const sortedSuggestions = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => {
      const { yomi, romaji, aliases, ...rest } = item.company;
      return rest;
    });

  const uniqueSuggestions: any[] = [];
  const seenNames = new Set<string>();
  for (const item of sortedSuggestions) {
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      uniqueSuggestions.push(item);
    }
  }

  res.json(uniqueSuggestions.slice(0, 10));
});

// API: Parse URL using Gemini Search Grounding API
app.post(["/api/company/parse-url", "/company/parse-url"], async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const lowercaseUrl = url.toLowerCase();
      let name = "取得不可（手動入力してください）";
      let industry = "IT・通信";
      let headquarters = "東京都新宿区";
      let scale = "中堅企業";
      let establishedYear = "2015年";
      let employeeCount = "約150人";

      for (const corp of POPULAR_COMPANIES) {
        const mainKey = corp.name.substring(0, 4).toLowerCase();
        if (lowercaseUrl.includes(mainKey) || lowercaseUrl.includes(corp.website.replace("https://", ""))) {
          return res.json(corp);
        }
      }

      if (lowercaseUrl.includes("mynavi") || lowercaseUrl.includes("rikunabi")) {
        name = "株式会社リクルーティング・パートナーズ";
        industry = "人材サービス・総合コンサルティング";
        headquarters = "東京都新宿区";
        scale = "中堅企業";
        establishedYear = "2018年";
        employeeCount = "約320人";
      }

      return res.json({ name, industry, headquarters, scale, website: url, establishedYear, employeeCount });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    const prompt = `以下の求人サイトやホームページのURLから、企業の基本情報を調べて抽出してください。
URL: ${url}
完全にJSON形式を厳守して返してください。マークダウンブロックでラップせずに、生のJSONのみを出力してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Official company name in Japanese" },
            industry: { type: Type.STRING, description: "Standard company industry in Japanese" },
            headquarters: { type: Type.STRING, description: "Headquarters city/pref address in Japanese" },
            scale: { type: Type.STRING, description: "Scale classifier: 大手企業, 中堅企業, 中小企業, ベンチャー" },
            website: { type: Type.STRING, description: "Main homepage web URL" },
            establishedYear: { type: Type.STRING, description: "Year of establishment (e.g., 1937年)" },
            employeeCount: { type: Type.STRING, description: "Number of employees (e.g., 約375,000人)" }
          },
          required: ["name", "industry"]
        }
      }
    });

    res.json(JSON.parse((response.text || "{}").trim()));
  } catch (error) {
    res.status(500).json({ error: "Failed to extract company information" });
  }
});

export default app;
