/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ThemePreset {
  id: string;
  name: string;
  color: string; // Tailwind color name like 'rose', 'sky', 'emerald', 'violet', 'orange', 'amber'
  hex: string;
  bg: string;
  text: string;
  border: string;
  lightBg: string;
  accent: string;
  hover: string;
  ring: string;
  bannerBg: string;
  textDark: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'rose',
    name: 'さくらピンク',
    color: 'rose',
    hex: '#FDA4AF',
    bg: 'bg-rose-400',
    text: 'text-rose-500',
    border: 'border-rose-200',
    lightBg: 'bg-rose-50/60',
    accent: 'accent-rose-400',
    hover: 'hover:bg-rose-500',
    ring: 'focus:ring-rose-300',
    bannerBg: 'bg-gradient-to-r from-rose-50 to-pink-50/40',
    textDark: 'text-rose-700'
  },
  {
    id: 'sky',
    name: 'アクアブルー',
    color: 'sky',
    hex: '#7DD3FC',
    bg: 'bg-sky-400',
    text: 'text-sky-500',
    border: 'border-sky-200',
    lightBg: 'bg-sky-50/60',
    accent: 'accent-sky-400',
    hover: 'hover:bg-sky-500',
    ring: 'focus:ring-sky-300',
    bannerBg: 'bg-gradient-to-r from-sky-50 to-indigo-50/40',
    textDark: 'text-sky-700'
  },
  {
    id: 'emerald',
    name: 'ミントグリーン',
    color: 'emerald',
    hex: '#6EE7B7',
    bg: 'bg-emerald-400',
    text: 'text-emerald-500',
    border: 'border-emerald-200',
    lightBg: 'bg-emerald-50/60',
    accent: 'accent-emerald-400',
    hover: 'hover:bg-emerald-500',
    ring: 'focus:ring-emerald-300',
    bannerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50/40',
    textDark: 'text-emerald-700'
  },
  {
    id: 'violet',
    name: 'ラベンダーヴェール',
    color: 'violet',
    hex: '#C084FC',
    bg: 'bg-violet-400',
    text: 'text-violet-500',
    border: 'border-violet-200',
    lightBg: 'bg-violet-50/60',
    accent: 'accent-violet-400',
    hover: 'hover:bg-violet-500',
    ring: 'focus:ring-violet-300',
    bannerBg: 'bg-gradient-to-r from-violet-50 to-purple-50/40',
    textDark: 'text-violet-700'
  },
  {
    id: 'orange',
    name: 'アプリコットハニー',
    color: 'orange',
    hex: '#FDBA74',
    bg: 'bg-orange-400',
    text: 'text-orange-500',
    border: 'border-orange-200',
    lightBg: 'bg-orange-50/60',
    accent: 'accent-orange-400',
    hover: 'hover:bg-orange-500',
    ring: 'focus:ring-orange-300',
    bannerBg: 'bg-gradient-to-r from-orange-50 to-amber-50/40',
    textDark: 'text-orange-700'
  },
  {
    id: 'amber',
    name: 'レモンシトロン',
    color: 'amber',
    hex: '#FDE047',
    bg: 'bg-amber-400',
    text: 'text-amber-600',
    border: 'border-amber-200',
    lightBg: 'bg-amber-50/60',
    accent: 'accent-amber-400',
    hover: 'hover:bg-amber-500',
    ring: 'focus:ring-amber-300',
    bannerBg: 'bg-gradient-to-r from-amber-50/80 to-yellow-50/40',
    textDark: 'text-amber-700'
  }
];

export function getTheme(colorName: string): ThemePreset {
  // Check if saved theme color exists, default to 'violet' or similar elegant pastel if invalid
  return THEME_PRESETS.find(p => p.color === colorName) || THEME_PRESETS[3];
}
