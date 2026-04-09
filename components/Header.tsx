// ============================================================
// Imports
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, THEME_DARK, THEME_LIGHT } from './constants';
import { Icon } from '@iconify/react';

// ============================================================
// Component
// ============================================================
export default function Header() {
  // ============================================================
  // State Declarations
  // ============================================================
  const [isDark, setIsDark] = useState(false);

  // ============================================================
  // 主题管理相关
  // ============================================================
  /**
   * 初始化主题设置
   * 优先使用 localStorage 中保存的主题，否则使用系统偏好
   */
  useEffect(() => {
    // 检查 localStorage 中的主题设置
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedTheme) {
      // 如果有保存的主题，使用保存的主题
      const isDarkTheme = savedTheme === THEME_DARK;
      setIsDark(isDarkTheme);
      if (isDarkTheme) {
        document.documentElement.classList.add(THEME_DARK);
      } else {
        document.documentElement.classList.remove(THEME_DARK);
      }
    } else {
      // 如果没有保存的主题，检查系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add(THEME_DARK);
        localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
      } else {
        document.documentElement.classList.remove(THEME_DARK);
        localStorage.setItem(THEME_STORAGE_KEY, THEME_LIGHT);
      }
    }
  }, []);

  /**
   * 切换主题
   */
  function toggleTheme() {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add(THEME_DARK);
      localStorage.setItem(THEME_STORAGE_KEY, THEME_DARK);
    } else {
      document.documentElement.classList.remove(THEME_DARK);
      localStorage.setItem(THEME_STORAGE_KEY, THEME_LIGHT);
    }
  }

  // ============================================================
  // JSX 渲染
  // ============================================================
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isDark ? "border-gray-800" : "bg-[#ffffff]"
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`w-8 h-8 transition-colors ${
                  isDark ? "fill-white" : "fill-black"
                }`}
                aria-hidden="true"
              >
                <path d="M7.75 11c-.69 0-1.25.56-1.25 1.25v1.5a1.25 1.25 0 1 0 2.5 0v-1.5C9 11.56 8.44 11 7.75 11zm1.27 4.5a.469.469 0 0 1 .48-.5h5a.47.47 0 0 1 .48.5c-.116 1.316-.759 2.5-2.98 2.5s-2.864-1.184-2.98-2.5zm7.23-4.5c-.69 0-1.25.56-1.25 1.25v1.5a1.25 1.25 0 1 0 2.5 0v-1.5c0-.69-.56-1.25-1.25-1.25z" />
                <path fillRule="evenodd" d="M21.255 3.82a1.725 1.725 0 0 0-2.141-1.195c-.557.16-1.406.44-2.264.866c-.78.386-1.647.93-2.293 1.677A18.442 18.442 0 0 0 12 5c-.93 0-1.784.059-2.569.17c-.645-.74-1.505-1.28-2.28-1.664a13.876 13.876 0 0 0-2.265-.866a1.725 1.725 0 0 0-2.141 1.196a23.645 23.645 0 0 0-.69 3.292c-.125.97-.191 2.07-.066 3.112C1.254 11.882 1 13.734 1 15.527C1 19.915 3.13 23 12 23c8.87 0 11-3.053 11-7.473c0-1.794-.255-3.647-.99-5.29c.127-1.046.06-2.15-.066-3.125a23.652 23.652 0 0 0-.689-3.292zM20.5 14c.5 3.5-1.5 6.5-8.5 6.5s-9-3-8.5-6.5c.583-4 3-6 8.5-6s7.928 2 8.5 6z" />
              </svg>
            </div>
            <a href="/" className="text-xl font-semibold hover:opacity-80 transition-opacity">
              Github Proxy
            </a>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex space-x-8">
              <a
                href="https://gh.llkk.cc/https://raw.githubusercontent.com/521xueweihan/GitHub520/refs/heads/main/hosts"
                className="text-gray-600 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                GitHub Host
              </a>
              <a
                href="https://akams.cn/sponsor.html"
                className="text-gray-600 dark:text-gray-100 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                捐赠
              </a>
            </nav>

            {/* Feedback Link */}
            <a
              href="http://github.akams.cn/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              title="反馈及建议"
            >
              <Icon 
                icon="solar:chat-square-like-bold" 
                className={`w-6 h-6 ${isDark ? "text-gray-100" : "text-gray-600"}`} 
              />
            </a>

            {/* Theme Toggle */}
            <div
              onClick={toggleTheme}
              className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
              title={isDark ? "切换到日间模式" : "切换到暗黑模式"}
            >
              {isDark ? (
                <Icon icon="solar:sun-bold" className="w-6 h-6 text-gray-100" />
              ) : (
                <Icon icon="solar:moon-stars-bold" className="w-6 h-6 text-gray-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
