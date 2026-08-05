/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ThemePreset } from '../utils/theme';

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  tabs: SidebarTab[];
  activeTab: string;
  setActiveTab: (id: any) => void;
  theme: ThemePreset;
  userName?: string;
}

// 広い画面（PC・タブレット）専用の常設サイドバー。Slackのチャンネルリストに倣い、
// ワークスペースカラー（theme.barBg）はライト/ダーク切替に関わらず一定に保つ。
export function Sidebar({ tabs, activeTab, setActiveTab, theme, userName }: SidebarProps) {
  return (
    <aside className={`hidden lg:flex lg:flex-col w-64 shrink-0 h-screen sticky top-0 ${theme.barBg} text-white`}>
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
        <span className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
          B
        </span>
        <span className="text-sm font-bold flex-1 truncate">Berufly</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        <span className="h-6 w-6 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold shrink-0">
          {(userName || 'ユ').slice(0, 1)}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {tabs.map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-sm cursor-pointer transition-colors ${
                isSelected ? 'bg-white/20 font-bold text-white' : 'font-medium text-white/75 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
