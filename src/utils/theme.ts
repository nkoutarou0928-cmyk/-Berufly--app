/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemePreset {
  id: string;
  name: string;
  color: string; // Tailwind color name like 'rose', 'sky', 'emerald', 'violet', 'orange', 'amber'
  hex: string; // decorative-only (charts/sparklines) — keep the softer pastel tone
  bg: string; // solid button/indicator fill — deep enough for AA contrast with onBg
  onBg: string; // text color guaranteed readable on top of `bg`
  text: string;
  border: string;
  lightBg: string;
  accent: string;
  hover: string;
  ring: string;
  textDark: string;
  barBg: string; // deep workspace-bar/sidebar shade (Slack-style nav chrome) — stays constant across light/dark mode
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose',
    name: 'さくらピンク',
    color: 'rose',
    hex: '#FDA4AF',
    bg: 'bg-rose-600',
    onBg: 'text-white',
    text: 'text-rose-500',
    border: 'border-rose-200',
    lightBg: 'bg-rose-50/60',
    accent: 'accent-rose-500',
    hover: 'hover:bg-rose-700',
    ring: 'focus:ring-rose-400',
    textDark: 'text-rose-700',
    barBg: 'bg-rose-900'
  },
  {
    id: 'sky',
    name: 'アクアブルー',
    color: 'sky',
    hex: '#7DD3FC',
    bg: 'bg-sky-600',
    onBg: 'text-white',
    text: 'text-sky-500',
    border: 'border-sky-200',
    lightBg: 'bg-sky-50/60',
    accent: 'accent-sky-500',
    hover: 'hover:bg-sky-700',
    ring: 'focus:ring-sky-400',
    textDark: 'text-sky-700',
    barBg: 'bg-sky-900'
  },
  {
    id: 'emerald',
    name: 'ミントグリーン',
    color: 'emerald',
    hex: '#6EE7B7',
    bg: 'bg-emerald-600',
    onBg: 'text-white',
    text: 'text-emerald-500',
    border: 'border-emerald-200',
    lightBg: 'bg-emerald-50/60',
    accent: 'accent-emerald-500',
    hover: 'hover:bg-emerald-700',
    ring: 'focus:ring-emerald-400',
    textDark: 'text-emerald-700',
    barBg: 'bg-emerald-900'
  },
  {
    id: 'violet',
    name: 'ラベンダーヴェール',
    color: 'violet',
    hex: '#C084FC',
    bg: 'bg-violet-600',
    onBg: 'text-white',
    text: 'text-violet-500',
    border: 'border-violet-200',
    lightBg: 'bg-violet-50/60',
    accent: 'accent-violet-500',
    hover: 'hover:bg-violet-700',
    ring: 'focus:ring-violet-400',
    textDark: 'text-violet-700',
    barBg: 'bg-violet-900'
  },
  {
    id: 'orange',
    name: 'アプリコットハニー',
    color: 'orange',
    hex: '#FDBA74',
    bg: 'bg-orange-600',
    onBg: 'text-white',
    text: 'text-orange-500',
    border: 'border-orange-200',
    lightBg: 'bg-orange-50/60',
    accent: 'accent-orange-500',
    hover: 'hover:bg-orange-700',
    ring: 'focus:ring-orange-400',
    textDark: 'text-orange-700',
    barBg: 'bg-orange-900'
  },
  {
    id: 'amber',
    name: 'レモンシトロン',
    color: 'amber',
    hex: '#FDE047',
    // Amber stays light at every usable step, so unlike the other five it keeps dark text
    // on its solid fill instead of chasing an AA-with-white shade that would stop reading as "amber".
    bg: 'bg-amber-400',
    onBg: 'text-amber-950',
    text: 'text-amber-600',
    border: 'border-amber-200',
    lightBg: 'bg-amber-50/60',
    accent: 'accent-amber-500',
    hover: 'hover:bg-amber-500',
    ring: 'focus:ring-amber-300',
    textDark: 'text-amber-700',
    barBg: 'bg-amber-900'
  }
];

export function getTheme(colorName: string): ThemePreset {
  // Default to emerald when unset/invalid — calmer and less "generic AI SaaS gradient"
  // than the indigo/violet combo this app used to fall back to.
  return THEME_PRESETS.find(p => p.color === colorName) || THEME_PRESETS[2];
}
