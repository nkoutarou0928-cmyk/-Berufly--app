/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StarData {
  isStar: boolean;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface ParsedSelfAnalysis {
  activeMode: 'free' | 'star';
  freeText: string;
  starData: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

/**
 * Parses a string to check if it's a valid serialized STAR data object (both legacy and new format).
 * Returns the parsed StarData object or null if it's plain text.
 */
export function parseStarData(text: string): StarData | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed) {
      // Check if new format
      if (parsed.starData && typeof parsed.starData === 'object') {
        return {
          isStar: true,
          situation: parsed.starData.situation || '',
          task: parsed.starData.task || '',
          action: parsed.starData.action || '',
          result: parsed.starData.result || '',
        };
      }
      // Check if old format
      if (parsed.isStar === true) {
        return {
          isStar: true,
          situation: parsed.situation || '',
          task: parsed.task || '',
          action: parsed.action || '',
          result: parsed.result || '',
        };
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  return null;
}

/**
 * Parses a string to check if it's a valid serialized self analysis data object.
 * Returns the structured ParsedSelfAnalysis.
 */
export function parseSelfAnalysisText(text: string): ParsedSelfAnalysis {
  if (!text) {
    return {
      activeMode: 'free',
      freeText: '',
      starData: { situation: '', task: '', action: '', result: '' }
    };
  }

  try {
    const parsed = JSON.parse(text);
    
    // Check if new format
    if (parsed && typeof parsed === 'object' && ('freeText' in parsed || 'starData' in parsed)) {
      return {
        activeMode: parsed.activeMode || 'free',
        freeText: parsed.freeText || '',
        starData: {
          situation: parsed.starData?.situation || '',
          task: parsed.starData?.task || '',
          action: parsed.starData?.action || '',
          result: parsed.starData?.result || ''
        }
      };
    }

    // Check if old format
    if (parsed && parsed.isStar === true) {
      const starData = {
        situation: parsed.situation || '',
        task: parsed.task || '',
        action: parsed.action || '',
        result: parsed.result || ''
      };
      return {
        activeMode: 'star',
        freeText: `【Situation（状況）】\n${starData.situation}\n\n【Task（課題・目標）】\n${starData.task}\n\n【Action（行動）】\n${starData.action}\n\n【Result（結果）】\n${starData.result}`,
        starData
      };
    }
  } catch (e) {
    // Ignore JSON parsing errors and treat as plain text
  }

  // Treat as plain text
  return {
    activeMode: 'free',
    freeText: text,
    starData: { situation: '', task: '', action: '', result: '' }
  };
}

/**
 * Formats a STAR data object or plain text into a beautifully readable plain text string.
 */
export function getDisplayRepresentation(text: string): string {
  const parsed = parseSelfAnalysisText(text);
  if (parsed.activeMode === 'star') {
    const s = parsed.starData;
    if (!s.situation && !s.task && !s.action && !s.result) {
      return '';
    }
    return `【Situation（状況）】\n${s.situation}\n\n【Task（課題・目標）】\n${s.task}\n\n【Action（行動）】\n${s.action}\n\n【Result（結果）】\n${s.result}`;
  }
  return parsed.freeText;
}
