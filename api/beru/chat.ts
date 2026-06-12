/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, message, context } = req.body;

    // 1. Validate required request inputs
    if (!type || !message) {
      return res.status(400).json({
        error: "Missing required fields 'type' or 'message' in the request body."
      });
    }

    if (type !== "search" && type !== "es" && type !== "self_analysis") {
      return res.status(400).json({
        error: "Invalid type. Must be 'search', 'es', or 'self_analysis'."
      });
    }

    // 2. Fetch API Key securely from the env
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[BERU Backend Error]: Gemini API key is missing from environment variables.");
      return res.status(500).json({
        error: "Gemini API key is not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY."
      });
    }

    // 3. Initialize GoogleGenAI SDK
    const ai = new GoogleGenAI({ apiKey });

    // 4. Define system instructions for BERU character alignment
    const baseSystemInstruction = 
      "あなたは就活生の味方、就活コンシェルジュのBERU（ベル）です。鈴をモチーフにした超シンプルで可愛いキャラクターとして、親しみやすくポジティブな敬語で会話してください。絶対に偉そうな態度は取らず、等身大でユーザーに寄り添ってください。回答は適度に箇条書きや改行を使ってスマートに整理してください。";

    let systemInstruction = baseSystemInstruction;
    let userPrompt = message;

    // 5. Construct role-specific rules and prompt structures based on the 'type' parameter
    if (type === "search") {
      systemInstruction += "\n\n【機能指示：企業・インターン検索】\nユーザーが企業やインターンを探すのを親身にサポートしてください。志望業界や気になる検索キーワード、タグ（#夏インターン、#本選考、#IT、#コンサル など）に対して、有効な情報検索のコツ、注目すべき業界の傾向、インターン準備のポイントなどを提示して力になってあげてください。";
      if (context) {
        userPrompt = `[検索・フィルターの文脈情報: ${typeof context === 'string' ? context : JSON.stringify(context)}]\n\n${message}`;
      }
    } else if (type === "es") {
      systemInstruction += "\n\n【機能指示：AI ES作成・添削】\nエントリーシート（ES）の志望動機作成や自己PRの添削を行ってください。文脈に特定の企業情報が含まれる場合は、その企業の業界、特徴、求める人物像、企業規模などを考慮したパーソナライズされたアドバイスや、具体的で魅力的な文章案を作成してください。";
      if (context) {
        userPrompt = `[選択された対象企業の詳細情報: ${typeof context === 'string' ? context : JSON.stringify(context)}]\n\n${message}`;
      }
    } else if (type === "self_analysis") {
      systemInstruction += "\n\n【機能指示：自己分析メンター】\n自己分析メンターとして、ユーザーの強み、学生時代頑張ったこと（ガクチカ）、大切にしている価値観、就活における不安や悩みを整理し、言語化するサポートをしてください。共感を持って温かく受け止めた後、本人が考えをさらに深められるような優しく的確な問いかけを1〜2点添えて返答してください。";
      if (context) {
        userPrompt = `[自己分析の登録・履歴文脈情報: ${typeof context === 'string' ? context : JSON.stringify(context)}]\n\n${message}`;
      }
    }

    // 6. Generate content via Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const reply = response.text || "ごめんなさい、お返事をうまく作れませんでした。もう一度話しかけてみてね！";
    return res.json({ reply });

  } catch (error: any) {
    console.error("[BERU Backend Error]:", error);
    return res.status(500).json({
      error: "AIとの通信中にエラーが発生しました。時間をおいて再度お試しください。",
      details: error?.message || String(error)
    });
  }
});

export default router;
