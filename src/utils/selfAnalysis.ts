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

/**
 * Parses a string to check if it's a valid serialized STAR data object.
 * Returns the parsed StarData object or null if it's plain text.
 */
export function parseStarData(text: string): StarData | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.isStar === true) {
      return {
        isStar: true,
        situation: parsed.situation || '',
        task: parsed.task || '',
        action: parsed.action || '',
        result: parsed.result || '',
      };
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  return null;
}

/**
 * Formats a STAR data object into a beautifully readable plain text string.
 */
export function getDisplayRepresentation(text: string): string {
  const parsed = parseStarData(text);
  if (parsed) {
    return `【Situation（状況）】\n${parsed.situation}\n\n【Task（課題・目標）】\n${parsed.task}\n\n【Action（行動）】\n${parsed.action}\n\n【Result（結果）】\n${parsed.result}`;
  }
  return text;
}
