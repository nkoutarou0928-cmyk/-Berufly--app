/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

export interface PopularCompany {
  name: string;
  industry: string;
  headquarters: string;
  scale: string;
  website: string;
}

export const POPULAR_COMPANIES: PopularCompany[] = [
  { name: "トヨタ自動車株式会社", industry: "製造業・自動車", headquarters: "愛知県豊田市", scale: "大手企業", website: "https://global.toyota/jp/" },
  { name: "ソニーグループ株式会社", industry: "電機・IT・エンタメ", headquarters: "東京都港区", scale: "大手企業", website: "https://www.sony.com/ja/" },
  { name: "ソフトバンクグループ株式会社", industry: "IT・通信", headquarters: "東京都港区", scale: "大手企業", website: "https://group.softbank/" },
  { name: "株式会社キーエンス", industry: "精密機器・電子", headquarters: "大阪府大阪市", scale: "大手企業", website: "https://www.keyence.co.jp/" },
  { name: "株式会社リクルート", industry: "人材・IT・サービス", headquarters: "東京都千代田区", scale: "大手企業", website: "https://www.recruit.co.jp/" },
  { name: "楽天グループ株式会社", industry: "EC・IT・金融", headquarters: "東京都世田谷区", scale: "大手企業", website: "https://corp.rakuten.co.jp/" },
  { name: "株式会社ファーストリテイリング", industry: "小売・アパレル", headquarters: "山口県山口市", scale: "大手企業", website: "https://www.fastretailing.com/jp/" },
  { name: "任天堂株式会社", industry: "ゲーム・エンタメ", headquarters: "京都府京都市", scale: "大手企業", website: "https://www.nintendo.co.jp/" },
  { name: "株式会社NTTデータ", industry: "IT・システムインテグレーター", headquarters: "東京都江東区", scale: "大手企業", website: "https://www.nttdata.com/jp/ja/" },
  { name: "LINEヤフー株式会社", industry: "IT・通信・メディア", headquarters: "東京都千代田区", scale: "大手企業", website: "https://www.lyg.co.jp/" },
  { name: "株式会社サイバーエージェント", industry: "IT・ネット広告・ゲーム", headquarters: "東京都渋谷区", scale: "大手企業", website: "https://www.cyberagent.co.jp/" },
  { name: "株式会社メルカリ", industry: "IT・EC", headquarters: "東京都港区", scale: "大手企業", website: "https://about.mercari.com/" },
  { name: "サントリーホールディングス株式会社", industry: "食品・飲料", headquarters: "大阪府大阪市", scale: "大手企業", website: "https://www.suntory.co.jp/" },
  { name: "味の素株式会社", industry: "食品・バイオ", headquarters: "東京都中央区", scale: "大手企業", website: "https://www.ajinomoto.co.jp/" },
  { name: "株式会社三菱UFJ銀行", industry: "金融・銀行", headquarters: "東京都千代田区", scale: "大手企業", website: "https://www.bk.mufg.jp/" },
  { name: "野村総合研究所株式会社", industry: "IT・コンサルティング", headquarters: "東京都千代田区", scale: "大手企業", website: "https://www.nri.com/jp" },
  { name: "伊藤忠商事株式会社", industry: "商社", headquarters: "東京都港区", scale: "大手企業", website: "https://www.itochu.co.jp/" },
  { name: "株式会社ZOZO", industry: "EC・アアパレル", headquarters: "千葉県千葉市", scale: "中堅企業", website: "https://corp.zozo.com/" },
  { name: "クラスメソッド株式会社", industry: "IT・クラウドサービス", headquarters: "東京都千代田区", scale: "中堅企業", website: "https://classmethod.jp/" },
  { name: "スマートニュース株式会社", industry: "IT・ニュースメディア", headquarters: "東京都渋谷区", scale: "ベンチャー", website: "https://www.smartnews.com/" },
  { name: "株式会社タイミー", industry: "IT・人材サービス", headquarters: "東京都港区", scale: "ベンチャー", website: "https://corp.timee.co.jp/" },
  { name: "株式会社カヤック", industry: "IT・エンタメ・クリエイティブ", headquarters: "神奈川県鎌倉市", scale: "中堅企業", website: "https://www.kayac.com/" }
];

export const suggestCompaniesLocal = (query: string): PopularCompany[] => {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    return POPULAR_COMPANIES.slice(0, 10);
  }
  
  const filtered = POPULAR_COMPANIES.filter(
    c => c.name.toLowerCase().includes(q) || 
         c.industry.toLowerCase().includes(q) || 
         c.website.toLowerCase().includes(q)
  );
  
  return filtered.slice(0, 8);
};
