// ============================================================
// Imports
// ============================================================
"use client";

import { ChevronDown, Download, ExternalLink, Clock, Tag } from "lucide-react";
import { useState } from "react";
import type { Release, ReleasesListViewProps } from './types';
import { FILE_SIZE_UNITS, FILE_SIZE_BASE, BEIJING_TIMEZONE_OFFSET } from './constants';

// ============================================================
// Component
// ============================================================
export default function ReleasesListView({ releases, repoName, selectedDomain }: ReleasesListViewProps) {
  // ============================================================
  // State Declarations
  // ============================================================
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // ============================================================
  // 格式化工具函数
  // ============================================================
  /**
   * 格式化文件大小
   */
  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(FILE_SIZE_BASE));
    return `${(bytes / Math.pow(FILE_SIZE_BASE, i)).toFixed(2)} ${FILE_SIZE_UNITS[i]}`;
  }

  /**
   * 格式化时间为北京时间
   */
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    // 转换为北京时间（UTC+8）
    const beijingTime = new Date(date.getTime() + BEIJING_TIMEZONE_OFFSET * 60 * 60 * 1000);
    
    const year = beijingTime.getUTCFullYear();
    const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getUTCDate()).padStart(2, '0');
    const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
    const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // ============================================================
  // 代理链接处理
  // ============================================================
  /**
   * 生成代理下载链接
   */
  function getProxyDownloadUrl(originalUrl: string): string {
    // 如果选择的是官方源，直接返回原始链接
    if (selectedDomain === 'github.com') {
      return originalUrl;
    }
    // 否则使用代理节点
    return `https://${selectedDomain}/${originalUrl}`;
  }

  // ============================================================
  // 事件处理函数
  // ============================================================
  /**
   * 切换展开/折叠
   */
  function toggleExpand(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  /**
   * 打开链接
   */
  function handleOpen(url: string) {
    window.open(url, '_blank');
  }

  // ============================================================
  // JSX 渲染
  // ============================================================

  return (
    <div className="space-y-4">
      {releases.map((release, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
          {/* Release Header */}
          <div className="p-4 flex items-center justify-between">
            {/* Left: Repo Icon + Name */}
            <div className="flex items-center gap-3 flex-1">
              {/* Release Icon */}
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              
              {/* Repo Name */}
              <div className="flex flex-col">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {repoName}
                </span>
              </div>
            </div>

            {/* Center: Version Tag */}
            <div className="flex-1 text-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {release.tag_name}
              </span>
            </div>

            {/* Right: Files Button + Time + External Link */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Files Button */}
              <button
                onClick={() => toggleExpand(index)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all min-w-[160px] ${
                  expandedIndex === index
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">{release.assets.length} 个文件</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Time */}
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatTime(release.published_at)}
              </span>

              {/* External Link */}
              <button
                onClick={() => handleOpen(release.html_url)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Assets List - Expandable */}
          <div
            className={`transition-all duration-300 ease-in-out overflow-auto ${
              expandedIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {release.assets.map((asset, assetIndex) => (
                <div
                  key={assetIndex}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  {/* Left: File Name */}
                  <div className="flex-1 min-w-0 mr-4">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-mono truncate block">
                      {asset.name}
                    </span>
                  </div>

                  {/* Right: Size + Downloads + Time + Button */}
                  <div className="flex items-center gap-6">
                    {/* File Size */}
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatFileSize(asset.size)}
                    </span>

                    {/* Download Count */}
                    <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {asset.download_count} 次下载
                    </span>

                    {/* Upload Time */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTime(asset.updated_at)}
                    </div>

                    {/* Download Button */}
                    <button
                      onClick={() => handleOpen(getProxyDownloadUrl(asset.browser_download_url))}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
