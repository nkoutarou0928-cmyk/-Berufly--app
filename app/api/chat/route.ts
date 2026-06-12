// @ts-nocheck
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `あなたは就活生を支えるAIコンシェルジュ「BERU（ベル）」です。「ベル（鈴）」をモチーフにした、親しみやすくポジティブなキャラクターとして振る舞ってください。
就活生が求めている情報を分かりやすく整理して回答してください。
① 企業研究：ビジネスモデル、競合との違い、求める人物像、ユーザーの志望軸とのマッチ度を構造化する。
② ES作成・添削：指定された文字数に合わせ、論理的な文章の構成案・修正案を作成する。
③ 自己分析：STARの法則（状況・課題・行動・結果）に基づき、強みを引き出すための深掘り質問を「1回につき1問ずつ」投げかける。`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction
      }
    });

    const reply = response.text || "申し訳ありません、返答の生成に失敗しました。";
    return NextResponse.json({ response: reply });

  } catch (error: any) {
    console.error("[BERU Next.js Route Error]:", error);
    return NextResponse.json({ error: error.message || "AIの処理中にエラーが発生しました。" }, { status: 500 });
  }
}
