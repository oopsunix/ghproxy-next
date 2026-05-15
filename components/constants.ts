// ============================================================
// 常量定义
// ============================================================

import { servicesConfig } from "@/config/services";

/**
 * 随机获取一个 GitHub API 基础 URL
 */
export function getRandomGitHubApiBase(): string {
  const { apiBases } = servicesConfig.github;
  const randomIndex = Math.floor(Math.random() * apiBases.length);
  return apiBases[randomIndex];
}

// 历史记录配置
export const MAX_HISTORY_SIZE = 10;

// UI 反馈时长
export const COPY_FEEDBACK_DURATION = 2000; // 毫秒

// 节点下拉列表配置
export const MAX_VISIBLE_NODES = 10;
export const NODE_ITEM_HEIGHT = 44; // px
export const MAX_DROPDOWN_HEIGHT = MAX_VISIBLE_NODES * NODE_ITEM_HEIGHT; // 440px

// 主题配置
export const THEME_STORAGE_KEY = 'theme';
export const THEME_DARK = 'dark';
export const THEME_LIGHT = 'light';

// 文件大小单位
export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];
export const FILE_SIZE_BASE = 1024;

// 时区配置
export const BEIJING_TIMEZONE_OFFSET = 8; // UTC+8

// 安全限制配置
export const CLICK_RATE_LIMIT = 3; // 1秒内最多点击次数
export const CLICK_RATE_WINDOW = 5 * 1000; // 1秒时间窗口（毫秒）

export const LATENCY_TEST_TIMEOUT = 30000; // 调大超时时间到 30 秒，因为大文件下载可能需要更久
export const LATENCY_SOURCE_API = 'api'; // 使用API提供的延迟
export const LATENCY_SOURCE_CLIENT = 'client'; // 客户端检测延迟
export const LATENCY_CACHE_DURATION = 5 * 60 * 1000; // 客户端检测结果缓存5分钟
export const LATENCY_AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 自动刷新间隔5分钟
