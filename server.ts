import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standard Japanese company database for autocomplete & offline fallback suggestions
const POPULAR_COMPANIES = [
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
  { name: "株式会社ZOZO", industry: "EC・アパレル", headquarters: "千葉県千葉市", scale: "中堅企業", website: "https://corp.zozo.com/" },
  { name: "クラスメソッド株式会社", industry: "IT・クラウドサービス", headquarters: "東京都千代田区", scale: "中堅企業", website: "https://classmethod.jp/" },
  { name: "スマートニュース株式会社", industry: "IT・ニュースメディア", headquarters: "東京都渋谷区", scale: "ベンチャー", website: "https://www.smartnews.com/" },
  { name: "株式会社タイミー", industry: "IT・人材サービス", headquarters: "東京都港区", scale: "ベンチャー", website: "https://corp.timee.co.jp/" },
  { name: "株式会社カヤック", industry: "IT・エンタメ・クリエイティブ", headquarters: "神奈川県鎌倉市", scale: "中堅企業", website: "https://www.kayac.com/" }
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // Simple connection check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Suggest Endpoint for corporate name autocomplete
  app.get("/api/company/suggest", (req, res) => {
    const q = (req.query.q as string || "").trim().toLowerCase();
    if (!q) {
      return res.json(POPULAR_COMPANIES.slice(0, 10));
    }
    
    // Filtering by name, industry, or website matching query
    const filtered = POPULAR_COMPANIES.filter(
      c => c.name.toLowerCase().includes(q) || 
           c.industry.toLowerCase().includes(q) || 
           c.website.toLowerCase().includes(q)
    );
    
    res.json(filtered.slice(0, 8));
  });

  // Parse URL Endpoint using Gemini with Search Grounding
  app.post("/api/company/parse-url", async (req, res) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback guess if no API KEY so the app still functions
        console.warn("GEMINI_API_KEY environment variable is not defined. Using fallback URL parser.");
        
        let name = "取得不可（手動入力してください）";
        let industry = "IT・通信";
        let headquarters = "東京都";
        let scale = "中堅企業";
        let guessedUrl = url;

        // Smart client-side placeholder guessing based on URLs
        if (url.includes("mynavi") || url.includes("rikunabi")) {
          name = "マイナビ/リクナビ求人企業";
          industry = "未確認業界";
        } else {
          try {
            const domain = new URL(url).hostname.replace("www.", "");
            const parts = domain.split(".");
            if (parts.length > 0) {
              const baseName = parts[0];
              name = baseName.charAt(0).toUpperCase() + baseName.slice(1) + " (自動抽出)";
            }
          } catch (_) {}
        }

        return res.json({ name, industry, headquarters, scale, website: guessedUrl });
      }

      // Initialize Google Gen AI
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Construct prompt to look up info using Google Search Grounding to guarantee correctness
      const prompt = `以下の求人サイトやホームページのURLから、企業の基本情報を調べて抽出してください。
URL: ${url}

以下のプロパティを含むJSONオブジェクトのみを取得してください:
- name: 企業の正式名称（例: トヨタ自動車株式会社, 株式会社タイミー 等）
- industry: 企業の業界カテゴリ（例: IT・通信, 電機, 不動産, コンサルティング, サービス 等、簡潔に）
- headquarters: 本社所在地（都道府県および市区町村、例: 東京都港区）
- scale: 企業規模（大手企業, 中堅企業, 中小企業, ベンチャー のいずれか）
- website: 企業の主たるホームページURL（入力されたURLそのものか、企業の代表ホームページURL）

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
              website: { type: Type.STRING, description: "Main homepage web URL" }
            },
            required: ["name", "industry"]
          }
        }
      });

      const text = response.text || "{}";
      const cleanJson = JSON.parse(text.trim());
      res.json(cleanJson);

    } catch (error) {
      console.error("Gemini Parse URL error:", error);
      res.status(500).json({ 
        error: "Failed to extract company information", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Vite development integration or static build serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
