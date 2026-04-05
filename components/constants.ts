// ============================================================
// 常量定义
// ============================================================

// API 配置
export const PROXY_API_URL = 'https://api.akams.cn/github';
export const API_FETCH_INTERVAL = 120 * 60 * 1000; // API节点获取间隔120分钟
// GitHub API 代理接口列表（随机分配避免频率限制）
export const GITHUB_API_BASES = [
  'https://api.github.com',
  // 可以添加更多 GitHub API 代理接口
  'https://gh.dpik.top/https://api.github.com',
];

/**
 * 随机获取一个 GitHub API 基础 URL
 */
export function getRandomGitHubApiBase(): string {
  const randomIndex = Math.floor(Math.random() * GITHUB_API_BASES.length);
  return GITHUB_API_BASES[randomIndex];
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

// 延迟检测配置
export const LATENCY_TEST_IMAGE_URL = 'https://raw.githubusercontent.com/microsoft/vscode/refs/heads/main/extensions/markdown-math/icon.png';
export const LATENCY_TEST_TIMEOUT = 10000; // 10秒超时
export const LATENCY_SOURCE_API = 'api'; // 使用API提供的延迟
export const LATENCY_SOURCE_CLIENT = 'client'; // 客户端检测延迟
export const LATENCY_CACHE_DURATION = 60 * 60 * 1000; // 客户端检测结果缓存60分钟

// Waline 评论配置
export const WALINE_SERVER_URL = 'https://waline.akams.cn'; // Waline服务器地址

// Umami 访问统计配置
export const UMAMI_WEBSITE_ID = 'daefb51d-9941-44e7-9ff5-c197263ededb'; // 在 Umami 中创建网站后获取的 Website ID，留空则禁用统计
export const UMAMI_URL = 'https://umami.akams.cn/'; // Umami 服务器地址，自托管时修改此值
