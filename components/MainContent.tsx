"use client";

// ============================================================
// Imports
// ============================================================
import { ChevronDown, AlertCircle, Check, Gauge, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { DomainNode, Release } from './types';
import {
  PROXY_API_URL,
  GITHUB_API_BASES,
  COPY_FEEDBACK_DURATION,
  MAX_DROPDOWN_HEIGHT,
  LATENCY_TEST_IMAGE_URLS,
  LATENCY_TEST_TIMEOUT,
  SPEED_TEST_FILE_URLS,
  LATENCY_SOURCE_API,
  LATENCY_SOURCE_CLIENT,
  LATENCY_CACHE_DURATION,
  LATENCY_AUTO_REFRESH_INTERVAL,
  API_FETCH_INTERVAL,
  CLICK_RATE_LIMIT,
  CLICK_RATE_WINDOW,
  WALINE_SERVER_URL
} from './constants';
import ReleasesListView from "./ReleasesListView";
import WalineComment from "./WalineComment";

interface MainContentProps {}

export default function MainContent({}: MainContentProps = {}) {
  // ============================================================
  // State Declarations
  // ============================================================
  const [activeTab, setActiveTab] = useState("git-clone");
  const [selectedNode, setSelectedNode] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [inputError, setInputError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [fetchReleases, setFetchReleases] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [repoName, setRepoName] = useState("");

  const [domains, setDomains] = useState<DomainNode[]>([]);
  const [isLoadingDomains, setIsLoadingDomains] = useState(true);
  const [latencySource, setLatencySource] = useState<string>(LATENCY_SOURCE_CLIENT); // 延迟来源：api 或 client
  const [isTestingLatency, setIsTestingLatency] = useState(false); // 是否正在检测延迟
  const [isTestingSpeed, setIsTestingSpeed] = useState(false); // 是否正在手动测速
  const [clickHistory, setClickHistory] = useState<number[]>([]); // 点击时间记录
  
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // 节点管理相关
  // ============================================================
  
  // 节点排序函数：全部按延迟升序（延迟越低越靠前）
  function sortDomains(domains: DomainNode[]): DomainNode[] {
    // 对所有节点按延迟升序排列
    return [...domains].sort((a, b) => {
      // 提取延迟数字
      const getLatencyValue = (latencyStr: string) => {
        if (!latencyStr || latencyStr === '-') return null;
        const match = latencyStr.match(/^([0-9.]+)/);
        return match ? parseFloat(match[1]) : null;
      };

      const latencyA = getLatencyValue(a.latency);
      const latencyB = getLatencyValue(b.latency);

      // 处理空值排序：无数据的排在最后
      if (latencyA === null && latencyB === null) return 0;
      if (latencyA === null) return 1;
      if (latencyB === null) return -1;

      return latencyA - latencyB; // 仅按延迟升序
    });
  }

  /**
   * 格式化延迟时间:超过1000ms转换为s显示
   */
  function formatLatency(latencyStr: string): string {
    if (latencyStr === 'timeout' || latencyStr === '-') return '-';
    
    // 提取数字部分
    const match = latencyStr.match(/^([0-9.]+)/);
    if (!match) return latencyStr;
    
    const latency = parseFloat(match[1]);
    
    // 超过1000ms,转换为秒
    if (latency >= 1000) {
      return `${(latency / 1000).toFixed(2)} s`;
    }
    
    return `${Math.round(latency)} ms`;
  }

  /**
   * 获取延迟颜色样式
   */
  function getLatencyStyle(latencyStr: string): { backgroundColor: string; color: string } {
    if (latencyStr === 'timeout' || latencyStr === '-') {
      return { backgroundColor: 'transparent', color: 'inherit' };
    }

    // 提取数字部分
    const match = latencyStr.match(/^([0-9.]+)/);
    if (!match) {
      return { backgroundColor: 'transparent', color: 'inherit' };
    }
// ... rest of the function (no changes needed for the color logic)
    
    const latency = parseFloat(match[1]);
    
    if (latency < 500) {
      return {
        backgroundColor: '#E8FFEA',
        color: '#00B42A'
      };
    } else if (latency < 1000) {
      return {
        backgroundColor: '#FFF7E8',
        color: '#FF7F00'
      };
    } else {
      return {
        backgroundColor: '#FFECE8',
        color: '#F53F3F'
      };
    }
  }

  /**
   * 获取标签颜色样式
   */
  function getLabelStyle(label: string): string {
    switch(label) {
      case '默认节点':
        return 'text-blue-400 dark:text-blue-300';
      case '公益贡献':
        return 'text-violet-400 dark:text-violet-300';
      case '搜索引擎':
        return 'text-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-700 dark:text-gray-300';
    }
  }

  // ============================================================
  // 缓存管理相关
  // ============================================================

  const API_CACHE_KEY = 'node_api_cache';
  const SELECTED_NODE_KEY = 'node_selected_node';
  const LATENCY_CACHE_KEY = 'node_latency_cache';
  const SPEED_CACHE_KEY = 'node_speed_cache';

  // 获取延迟缓存
  function getLatencyCache(): { [host: string]: { value: string, timestamp: number } } {
    try {
      const cached = localStorage.getItem(LATENCY_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  }

  // 保存延迟缓存
  function saveLatencyCache(host: string, latency: string) {
    const cache = getLatencyCache();
    cache[host] = { value: latency, timestamp: Date.now() };
    localStorage.setItem(LATENCY_CACHE_KEY, JSON.stringify(cache));
  }

  // 获取速度缓存
  function getSpeedCache(): { [host: string]: string } {
    try {
      const cached = localStorage.getItem(SPEED_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  }

  // 保存速度缓存
  function saveSpeedCache(host: string, speed: string) {
    const cache = getSpeedCache();
    cache[host] = speed;
    localStorage.setItem(SPEED_CACHE_KEY, JSON.stringify(cache));
  }

  // 从 API 获取节点列表
  async function fetchDomains(): Promise<DomainNode[]> {
    try {
      setIsLoadingDomains(true);
      
      const latencyCache = getLatencyCache();
      const speedCache = getSpeedCache();
      const now = Date.now();

      // 辅助函数：应用缓存数据到节点
      const applyCache = (node: any): DomainNode => {
        const cachedLat = latencyCache[node.host];
        const cachedSpeed = speedCache[node.host];
        
        let latency = '-';
        // 如果延迟缓存未过期（60秒），则使用缓存
        if (cachedLat && now - cachedLat.timestamp < LATENCY_CACHE_DURATION) {
          latency = cachedLat.value;
        }

        return {
          ...node,
          latency: latency,
          speed: cachedSpeed || '-'
        };
      };
      
      // 检查 API 获取缓存（120分钟）
      const apiCache = localStorage.getItem(API_CACHE_KEY);
      
      if (apiCache) {
        try {
          const { timestamp, domains: cachedDomains } = JSON.parse(apiCache);
          
          // 如果 API 缓存未过期，使用缓存数据
          if (now - timestamp < API_FETCH_INTERVAL) {
            console.log('使用 API 缓存数据');
            
            // 应用延迟和速度缓存
            const initialNodes = cachedDomains.map(applyCache);
            
            const sortedList = sortDomains(initialNodes);
            setDomains(sortedList);
            setIsLoadingDomains(false);
            return sortedList;
          }
        } catch (e) {
          console.error('解析 API 缓存失败:', e);
        }
      }
      
      // 获取新数据
      const response = await fetch(PROXY_API_URL);
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.code === 200 && Array.isArray(result.data)) {
        // 转换 API 数据，只取节点信息，延迟和速度从缓存获取或初始化
        const domainList: DomainNode[] = result.data.map((item: any) => {
          const url = new URL(item.url);
          const host = url.host;
          let label = item.tag;
          
          if (host === 'gh.llkk.cc') {
            label = '默认节点';
          } else if (item.tag === 'donate') {
            label = '公益贡献';
          } else if (item.tag === 'search') {
            label = '搜索引擎';
          }
          
          return applyCache({
            value: host,
            label: label,
            host: host
          });
        });
        
        // 缓存 API 节点基础数据 (不带延迟和速度，因为它们有独立缓存)
        const baseDomains = domainList.map(node => ({
          value: node.value,
          label: node.label,
          host: node.host
        }));

        localStorage.setItem(API_CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          domains: baseDomains,
        }));
        
        const sortedList = sortDomains(domainList);
        setDomains(sortedList);
        setIsLoadingDomains(false);
        return sortedList;
      } else {
        throw new Error('API 返回数据格式错误');
      }
    } catch (error) {
      console.error('获取节点列表失败:', error);
      const fallbackDomains: DomainNode[] = [{
        value: "gh.llkk.cc",
        label: "默认节点",
        host: "gh.llkk.cc",
        latency: "-",
        speed: "-",
      }];
      setDomains(fallbackDomains);
      return fallbackDomains;
    } finally {
      setIsLoadingDomains(false);
    }
  }

  // 获取选中节点
  function getSelectedNode(): DomainNode {
    return domains.find((d) => d.value === selectedNode) || domains[0];
  }

  /**
   * 直接检测节点站点的网站延迟
   * 通过 HEAD 请求计算响应时间
   */
  async function testNodeWebsiteLatency(node: DomainNode): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const url = `https://${node.value}`;
      
      // 设置超时
      const timeout = setTimeout(() => {
        resolve(9999); // 超时返回最大延迟
      }, LATENCY_TEST_TIMEOUT);
      
      // 使用 fetch 发起 HEAD 请求
      fetch(url, {
        method: 'HEAD',
        mode: 'no-cors', // 避免 CORS 问题
        cache: 'no-cache',
      })
        .then(() => {
          clearTimeout(timeout);
          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);
          resolve(latency);
        })
        .catch(() => {
          clearTimeout(timeout);
          // 即使出错，也计算响应时间（no-cors 模式下会触发 opaque response）
          const endTime = performance.now();
          const latency = Math.round(endTime - startTime);
          // 如果响应时间超过超时时间，返回最大延迟
          resolve(latency > LATENCY_TEST_TIMEOUT ? 9999 : latency);
        });
    });
  }

  /**
   * 客户端检测单个节点延迟
   */
  async function testNodeLatencyByImage(node: DomainNode, imageUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      const startTime = performance.now();
      
      const timeout = setTimeout(() => {
        img.src = ''; 
        resolve(9999);
      }, LATENCY_TEST_TIMEOUT);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(Math.round(performance.now() - startTime));
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(9999);
      };
      
      const timestamp = Date.now();
      // 使用传入的随机图片 URL
      img.src = `https://${node.value}/${imageUrl}?t=${timestamp}`;
    });
  }

  /**
   * 客户端节点带宽测速
   */
  async function testNodeSpeed(node: DomainNode, fileUrl: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), LATENCY_TEST_TIMEOUT);

    try {
      const startTime = performance.now();
      const timestamp = Date.now();
      
      // 使用传入的随机文件 URL，并补齐协议头
      const finalUrl = `https://${node.value}/${fileUrl}?t=${timestamp}`;
      
      const response = await fetch(finalUrl, {
        cache: 'no-cache',
        signal: controller.signal
      });
      
      if (!response.ok) {
        clearTimeout(timeoutId);
        return '-';
      }
      
      const blob = await response.blob();
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      
      if (durationInSeconds <= 0) return '-';
      
      // 计算 Mbps: (字节数 * 8位) / 时间(秒) / 1024 / 1024
      const mbps = ((blob.size * 8) / durationInSeconds) / (1024 * 1024);
      return `${mbps.toFixed(1)}Mbps`;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn(`测速超时已中断 ${node.host}`);
        return 'timeout';
      }
      console.error(`测速失败 ${node.host}:`, error);
      return '-';
    }
  }

  /**
   * 检测节点延迟
   */
  async function testNodeLatency(node: DomainNode, imageUrl: string): Promise<number> {
    try {
      return await testNodeLatencyByImage(node, imageUrl);
    } catch (error) {
      return 9999;
    }
  }

  /**
   * 批量检测
   * mode: 'latency' 只测延迟 | 'speed' 只测速度
   */
  async function testAllNodesLatency(nodeList: DomainNode[], mode: 'latency' | 'speed' = 'latency'): Promise<DomainNode[]> {
    if (nodeList.length === 0) return [];
    
    if (mode === 'latency') {
      setIsTestingLatency(true);
    } else {
      setIsTestingSpeed(true);
    }
    
    try {
      // 在本批次开始前，随机选择一个资源 URL，保证本批次内一致
      const selectedLatencyUrl = mode === 'latency'
        ? LATENCY_TEST_IMAGE_URLS[Math.floor(Math.random() * LATENCY_TEST_IMAGE_URLS.length)]
        : '';
      
      const selectedSpeedUrl = mode === 'speed'
        ? SPEED_TEST_FILE_URLS[Math.floor(Math.random() * SPEED_TEST_FILE_URLS.length)]
        : '';

      const updatedNodes = [...nodeList];
      
      const promises = nodeList.map(async (node, index) => {
        if (mode === 'latency') {
          // 只测延迟
          const latencyValue = await testNodeLatency(node, selectedLatencyUrl);
          // 超时标记为 timeout 而不是 -，避免 useEffect 误以为未测试
          const latencyStr = latencyValue >= 9999 ? 'timeout' : `${latencyValue}ms`;
          updatedNodes[index] = {
            ...updatedNodes[index],
            latency: latencyStr,
          };
          // 保存缓存
          saveLatencyCache(node.host, latencyStr);
          // 立即更新 UI 展示排序
          setDomains(sortDomains([...updatedNodes]));
        } else {
          // 只测速度
          const speedStr = await testNodeSpeed(node, selectedSpeedUrl);
          updatedNodes[index] = {
            ...updatedNodes[index],
            speed: speedStr,
          };
          // 保存缓存
          saveSpeedCache(node.host, speedStr);
          // 测速完成后也更新 UI (此时不影响排序，因为 sortDomains 只看延迟)
          setDomains([...updatedNodes]);
        }
        return updatedNodes[index];
      });
      
      await Promise.all(promises);
      return updatedNodes;
    } finally {
      if (mode === 'latency') {
        setIsTestingLatency(false);
      } else {
        setIsTestingSpeed(false);
      }
    }
  }

  /**
   * 节点测速按钮触发 (手动模式)
   */
  async function handleRefreshLatency() {
    if (isTestingSpeed) return;

    // 只将速度位归零，延迟保持现状
    const resetSpeedNodes = domains.map(node => ({
      ...node,
      speed: '-'
    }));
    setDomains(resetSpeedNodes);

    // 触发只测速度模式
    await testAllNodesLatency(resetSpeedNodes, 'speed');
  }

  // 使用 Ref 追踪状态，避免 useEffect 循环
  const domainsRef = useRef<DomainNode[]>([]);
  const isTestingRef = useRef(false);
  const initialTestAttempted = useRef(false);

  useEffect(() => {
    domainsRef.current = domains;
    isTestingRef.current = isTestingLatency;
  }, [domains, isTestingLatency]);

  // 自动刷新延迟
  useEffect(() => {
    if (domains.length === 0 || isLoadingDomains) return;
    
    // 1. 初始检查：只在未尝试过且有节点为 '-' 时触发一次
    if (!initialTestAttempted.current) {
      const hasUntested = domains.some(d => d.latency === '-');
      if (hasUntested && !isTestingLatency) {
        initialTestAttempted.current = true;
        testAllNodesLatency(domains, 'latency');
      }
    }

    // 2. 设置稳定的 60s 定时器
    const interval = setInterval(() => {
      // 通过 Ref 获取最新状态，避免闭包问题，且不依赖 isTestingLatency 触发 effect 重置
      if (!isTestingRef.current && domainsRef.current.length > 0) {
        testAllNodesLatency(domainsRef.current, 'latency');
      }
    }, LATENCY_AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
    // 仅在域名列表首次加载完成时启动定时器逻辑，后续不再因为测试状态改变而重置定时器
  }, [domains.length > 0, isLoadingDomains]);

  // ============================================================
  // localStorage 数据持久化
  // ============================================================
  
  // 从 localStorage 加载设置
  useEffect(() => {
    const savedNode = localStorage.getItem(SELECTED_NODE_KEY);
    const savedFetchReleases = localStorage.getItem('fetchReleases');
    const savedLatencySource = localStorage.getItem('latencySource');
    
    // 清除旧的历史记录数据
    localStorage.removeItem('inputHistory');
    
    if (savedFetchReleases !== null) {
      setFetchReleases(savedFetchReleases === 'true');
    }
    
    // 加载延迟来源设置，默认为客户端检测
    if (savedLatencySource) {
      setLatencySource(savedLatencySource);
    }

    // 异步获取节点列表
    fetchDomains().then((domainList) => {
      if (domainList.length > 0) {
        // 优先使用 savedNode（如果存在）
        if (savedNode && domainList.some(d => d.value === savedNode)) {
          setSelectedNode(savedNode);
        } else {
          // 默认选择 gh.llkk.cc，如果不存在则使用第一个节点
          const defaultNode = domainList.find(d => d.value === 'gh.llkk.cc');
          setSelectedNode(defaultNode ? 'gh.llkk.cc' : domainList[0].value);
        }
      }
    });
  }, []);

  // 保存节点选择到 localStorage
  useEffect(() => {
    if (selectedNode) {
      localStorage.setItem(SELECTED_NODE_KEY, selectedNode);
    }
  }, [selectedNode]);

  // 保存 Releases 开关状态到 localStorage
  useEffect(() => {
    localStorage.setItem('fetchReleases', String(fetchReleases));
  }, [fetchReleases]);



  // ============================================================
  // URL 校验与解析
  // ============================================================
  
  // 校验 GitHub URL
  function validateGitHubUrl(url: string): boolean {
    if (!url.trim()) return true; // 空值不显示错误
    // GitHub URL 正则表达式 - 支持 GitHub 官方域名和常见镜像站（kkgithub.com）
    const githubRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)*(github(usercontent)?|kkgithub)\.com/i;
    return githubRegex.test(url);
  }

  // 检查是否是 github.com 域名
  function isGitHubComDomain(url: string): boolean {
    const githubComRegex = /^(https?:\/\/)?(www\.)?github\.com/i;
    return githubComRegex.test(url);
  }

  // 从 GitHub URL 提取用户名和仓库名
  function extractRepoInfo(url: string): { user: string; repo: string } | null {
    try {
      // 移除协议和域名，提取路径
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
      if (match && match[1] && match[2]) {
        // 移除可能的 .git 后缀
        const repo = match[2].replace(/\.git$/, '');
        return { user: match[1], repo };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // ============================================================
  // GitHub Releases API
  // ============================================================
  
  /**
   * 判断是否为网络错误
   */
  function isNetworkError(error: any): boolean {
    // 网络错误类型：TypeError, fetch 失败, CORS 错误等
    return (
      error instanceof TypeError ||
      error.message?.includes('网络错误') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('Network request failed') ||
      error.message?.includes('CORS')
    );
  }

  /**
   * 尝试使用所有 API 接口获取 Releases（带回退机制）
   */
  async function fetchGitHubReleasesWithFallback(user: string, repo: string): Promise<Release[]> {
    const apiBaseUrls = [...GITHUB_API_BASES]; // 复制数组
    const errors: { url: string; error: string; isRetryable: boolean }[] = [];
    
    // 打乱顺序，实现随机分配
    for (let i = apiBaseUrls.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [apiBaseUrls[i], apiBaseUrls[j]] = [apiBaseUrls[j], apiBaseUrls[i]];
    }
    
    // 依次尝试每个 API 接口
    for (const apiBase of apiBaseUrls) {
      const apiUrl = `${apiBase}/repos/${user}/${repo}/releases`;
      
      try {
        console.log(`尝试使用 API: ${apiBase}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          // 根据 HTTP 状态码判断是否支持回退
          if (response.status === 404) {
            // 404 仓库不存在，不回退（所有接口结果都一样）
            throw new Error('仓库不存在或未找到 Releases');
          } else if (response.status === 403) {
            // 403 频率限制，支持回退（其他接口可能没限制）
            const error = new Error('API 请求频率限制');
            (error as any).isRetryable = true;
            throw error;
          } else {
            // 其他 HTTP 错误，支持回退（其他接口可能正常）
            const error = new Error(`HTTP 错误: ${response.status}`);
            (error as any).isRetryable = true;
            throw error;
          }
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          // 仓库无 Releases，不回退
          throw new Error('该仓库没有 Releases');
        }
        
        console.log(`成功获取 Releases: ${apiBase}`);
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        const isRetryable = (error as any).isRetryable || isNetworkError(error);
        
        // 判断是否支持回退
        if (isRetryable) {
          // 支持回退的错误：网络错误、频率限制、其他HTTP错误
          console.warn(`${apiBase} ${errorMessage}，切换到下一个接口`);
          errors.push({ url: apiBase, error: errorMessage, isRetryable: true });
          continue; // 继续尝试下一个
        } else {
          // 不支持回退的错误：404 仓库不存在、无Releases
          throw error;
        }
      }
    }
    
    // 所有接口都失败，生成汇总错误信息
    console.error('所有 API 接口都失败:', errors);
    
    // 统计错误类型
    const hasNetworkError = errors.some(e => e.error.includes('网络错误') || e.error.includes('Failed to fetch'));
    const hasRateLimit = errors.some(e => e.error.includes('频率限制'));
    
    if (hasRateLimit && errors.length === GITHUB_API_BASES.length) {
      throw new Error('所有 GitHub API 接口都触发频率限制，请稍后再试');
    } else if (hasNetworkError) {
      throw new Error('所有 GitHub API 接口都无法访问，请检查网络连接');
    } else {
      throw new Error('所有 GitHub API 接口请求失败，请稍后再试');
    }
  }
  
  // 调用 GitHub API 获取 Releases（兼容旧接口）
  async function fetchGitHubReleases(user: string, repo: string): Promise<Release[]> {
    return fetchGitHubReleasesWithFallback(user, repo);
  }

  // ============================================================
  // Tab 管理
  // ============================================================
  
  // 切换 Tab
  function handleTabChange(tab: string) {
    setActiveTab(tab);
  }

  // 更新 Tab 指示器
  function updateIndicator(tab: string) {
    const element = tabRefs.current[tab];
    if (element) {
      setIndicatorStyle({
        left: element.offsetLeft,
        width: element.offsetWidth,
      });
    }
  }

  // Tab 指示器同步
  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab]);

  // ============================================================
  // 输入处理
  // ============================================================
  
  /**
   * 检查点击频率是否超限
   * @returns true 表示超限，false 表示未超限
   */
  function checkClickRateLimit(): boolean {
    const now = Date.now();
    
    // 过滤掉时间窗口之外的记录
    const recentClicks = clickHistory.filter(timestamp => now - timestamp < CLICK_RATE_WINDOW);
    
    // 检查是否超限
    if (recentClicks.length >= CLICK_RATE_LIMIT) {
      return true; // 超限
    }
    
    // 未超限，添加当前点击记录
    setClickHistory([...recentClicks, now]);
    return false; // 未超限
  }
  
  // 处理输入变化
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    
    // 校验 URL
    if (value && !validateGitHubUrl(value)) {
      setInputError("请输入有效的 GitHub URL 或 kkgithub.com 镜像链接");
    } else {
      setInputError("");
    }
  }

  /**
   * 获取按钮显示文本
   */
  function getButtonText(): string {
    if (fetchReleases) {
      return "开始获取";
    }
    if (inputValue.trim()) {
      return "开始下载";
    }
    return "Go";
  }

  // 处理下载
  async function handleDownload() {
    if (!inputValue.trim()) {
      setInputError("请输入 GitHub 文件链接");
      return;
    }
    
    // 如果启用了 Releases 功能，检查点击频率
    if (fetchReleases) {
      // 检查频率限制
      if (checkClickRateLimit()) {
        alert(`操作频繁！\n\n为了保护 API 配额，请稍后再试。`);
        return;
      }
    }
    

    
    // 如果启用了 Releases 功能
    if (fetchReleases) {
      // 检查是否是 github.com 域名
      if (!isGitHubComDomain(inputValue)) {
        setInputError("仅支持 github.com 链接");
        return;
      }
      
      // 提取用户名和仓库名
      const repoInfo = extractRepoInfo(inputValue);
      if (!repoInfo) {
        setInputError("无法解析仓库信息，请输入正确的 GitHub 仓库链接");
        return;
      }
      
      // 清除错误信息
      setInputError("");
      setIsLoading(true);
      
      try {
        // 调用 API 获取 Releases
        const releasesData = await fetchGitHubReleases(repoInfo.user, repoInfo.repo);
        setReleases(releasesData);
        setRepoName(repoInfo.repo);
      } catch (error) {
        if (error instanceof Error) {
          setInputError(error.message);
        } else {
          setInputError("获取 Releases 失败");
        }
        setReleases([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 未启用 Releases 功能，使用缓存节点或默认节点拼接链接并在新标签页打开
      if (!validateGitHubUrl(inputValue)) {
        setInputError("请输入有效的 GitHub URL 或 kkgithub.com 镜像链接");
        return;
      }
      
       // 获取代理链接
      const proxyUrl = getProxyUrl(inputValue);
      
      // 在新标签页打开
      window.open(proxyUrl, '_blank');
    }
  }

  // ============================================================
  // 代理链接生成
  // ============================================================
  
  // 生成代理链接
  function getProxyUrl(url: string): string {
    if (!url) return '';
    // 将 kkgithub.com 替换为 github.com
    const normalizedUrl = url.replace(/kkgithub\.com/gi, 'github.com');
    return `https://${selectedNode}/${normalizedUrl}`;
  }

  // 获取Tab内容
  function getTabContent() {
    // 如果输入框为空或校验失败，不生成内容
    if (!inputValue || inputError) return [];

    if (activeTab === 'git-clone') {
      return [
        { url: getProxyUrl(inputValue), type: 'git-clone' },
      ];
    }

    if (activeTab === 'wget-curl') {
      return [
        { url: getProxyUrl(inputValue), type: 'wget' },
        { url: getProxyUrl(inputValue), type: 'curl' },
      ];
    }

    if (activeTab === 'direct-download') {
      return [
        { url: getProxyUrl(inputValue), type: 'direct-download' },
      ];
    }

    return [];
  }

  // 格式化命令
  function formatCommand(url: string, type: string): string {
    if (type === 'git-clone') {
      return `git clone ${url}`;
    }
    if (type === 'wget') {
      return `wget ${url}`;
    }
    if (type === 'curl') {
      return `curl -O ${url}`;
    }
    return url;
  }

  // ============================================================
  // 工具函数
  // ============================================================
  
  // 复制到剪贴板
  async function handleCopy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), COPY_FEEDBACK_DURATION);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }

  // 打开链接
  function handleOpen(url: string) {
    window.open(url, '_blank');
  }

  // ============================================================
  // 事件监听 useEffect
  // ============================================================
  
  // 点击外部关闭监听
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ============================================================
  // JSX 渲染
  // ============================================================
  
  return (
    <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1000px] mx-auto">
        {/* Container for content */}
        <div className="pt-40">
          {/* Title Section */}
          <div className="text-center w-full mb-12">
            <h1 className="font-bold mb-4 text-6xl">
              Github <span className="text-blue-600">Proxy</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              支持 API、Git Clone、Releases、Archive、Gist、Raw 等资源加速下载，提升 GitHub 文件下载体验。
            </p>
          </div>

          {/* Input Section */}
          <div className="w-full relative z-[10001] mb-8">
            {/* Input Field and Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="输入 Github 文件链接"
                  className={`w-full px-4 py-3 dark:bg-gray-300 border rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-500 ${
                    inputError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  }`}
                />
                {inputError && (
                  <p className="mt-1 text-sm text-red-500">{inputError}</p>
                )}
              </div>

              {/* Download Button */}
              <button 
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[48px]"
                disabled={!inputValue.trim() || !!inputError}
              >
                {getButtonText()}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        <div>
          {/* Domain Selector - Custom Dropdown */}
          <div className="relative z-[9999]">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
              {/* 左侧描述文本 - 移动端隐藏 */}
              <span className="hidden md:block text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                节点选择：
              </span>

              {/* 下拉菜单 - 移动端全宽，桌面端 flex-1 */}
              <div
                ref={dropdownRef}
                className="relative w-full md:flex-1 md:max-w-xl"
              >
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isLoadingDomains}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingDomains ? (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>加载节点列表中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Host - 55% */}
                      <span className="text-gray-700 dark:text-gray-300 truncate" style={{ width: '55%' }}>
                        {getSelectedNode().host}
                      </span>
                      {/* 延迟 - 15% */}
                      <span 
                        className="text-sm text-center shrink-0 px-2 py-1 rounded font-medium" 
                        style={{ 
                          width: '18%', 
                          minWidth: '50px',
                          ...getLatencyStyle(getSelectedNode().latency)
                        }}
                      >
                        {formatLatency(getSelectedNode().latency)}
                      </span>
                      {/* 速度 - 10% */}
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1 shrink-0" style={{ width: '10%', minWidth: '80px' }}>
                        {getSelectedNode().speed}
                      </span>
                      {/* 下拉箭头 - 5% */}
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 shrink-0 ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                        style={{ width: '5%', minWidth: '20px' }}
                      />
                    </div>
                  )}
                </button>

                {/* Custom Dropdown Menu - 限制显示 10 条，支持滚动 */}
                {!isLoadingDomains && (
                  <div
                    className={`absolute z-[9999] w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl transition-all duration-300 origin-top ${
                      showDropdown
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-0 max-h-0"
                    }`}
                    style={{ 
                      position: 'absolute',
                      maxHeight: showDropdown ? `${MAX_DROPDOWN_HEIGHT}px` : '0',
                      overflowY: 'auto',
                      overflowX: 'hidden'
                    }}
                  >
                    {domains.map((domain) => (
                    <button
                      key={domain.value}
                      type="button"
                      onClick={() => {
                        setSelectedNode(domain.value);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        selectedNode === domain.value
                          ? "bg-gray-50 dark:bg-gray-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* 标签 - 20% */}
                        <span
                          className={`font-medium shrink-0 ${getLabelStyle(domain.label)}`}
                          style={{ width: '15%', minWidth: '80px' }}
                        >
                          [{domain.label}]
                        </span>
                        {/* Host - 55% */}
                        <span className="text-gray-700 dark:text-gray-300 truncate" style={{ width: '55%' }}>
                          {domain.host}
                        </span>
                        {/* 延迟 - 15% */}
                        <span 
                          className="text-sm text-center shrink-0 px-2 py-1 rounded font-medium" 
                          style={{ 
                            width: '18%', 
                            minWidth: '50px',
                            ...getLatencyStyle(domain.latency)
                          }}
                        >
                          {formatLatency(domain.latency)}
                        </span>
                        {/* 速度 - 10% */}
                        <span className="text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1 shrink-0" style={{ width: '10%', minWidth: '80px' }}>
                          {domain.speed}
                        </span>
                      </div>
                    </button>
                  ))}
                  </div>
                )}
              </div>

              {/* 节点测速按钮 */}
              <button
                type="button"
                onClick={handleRefreshLatency}
                disabled={isTestingSpeed || isLoadingDomains}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all whitespace-nowrap bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="开始节点测速"
              >
                <Gauge className={`w-4 h-4 ${isTestingSpeed ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">
                  {isTestingSpeed ? '测速中...' : '节点测速'}
                </span>
              </button>

              {/* 右侧开关按钮 - 移动端全宽，桌面端自适应 */}
              <button
                type="button"
                onClick={() => {
                  const newValue = !fetchReleases;
                  setFetchReleases(newValue);
                  localStorage.setItem('fetchReleases', String(newValue));
                }}
                className={`w-full md:w-auto flex items-center justify-center md:justify-start gap-2 px-4 py-3 rounded-lg border transition-all whitespace-nowrap ${
                  fetchReleases
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div
                  className={`w-10 h-6 rounded-full transition-all relative ${
                    fetchReleases
                      ? "bg-blue-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                      fetchReleases ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className={`text-sm font-medium ${fetchReleases ? "dark:text-white" : ""}`}>获取Releases列表</span>
              </button>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              公益服务，请勿滥用。加速源来自热心网友贡献，在此感谢每一位分享者的慷慨奉献！
            </p>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          )}

          {/* Releases List View */}
          {!isLoading && fetchReleases && releases.length > 0 && (
            <div className="mb-8">
              <ReleasesListView 
                releases={releases} 
                repoName={repoName} 
                selectedDomain={selectedNode}
              />
            </div>
          )}

          {/* Tabs with Content - 统一卡片 */}
          {!isLoading && !fetchReleases && inputValue && !inputError && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-8">
              {/* Tab 按钮区域 */}
              <div className="relative grid grid-cols-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {/* Animated Indicator */}
                <div
                  className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
                  style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                  }}
                />

                <button
                  ref={(el) => {
                    tabRefs.current["git-clone"] = el;
                  }}
                  onClick={() => handleTabChange("git-clone")}
                  className={`pb-1 transition-all duration-300 text-center relative ${
                    activeTab === "git-clone"
                      ? "text-blue-600 scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 scale-100"
                  }`}
                >
                  Git Clone
                </button>
                <button
                  ref={(el) => {
                    tabRefs.current["wget-curl"] = el;
                  }}
                  onClick={() => handleTabChange("wget-curl")}
                  className={`pb-1 transition-all duration-300 text-center relative ${
                    activeTab === "wget-curl"
                      ? "text-blue-600 scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 scale-100"
                  }`}
                >
                  Wget & Curl
                </button>
                <button
                  ref={(el) => {
                    tabRefs.current["direct-download"] = el;
                  }}
                  onClick={() => handleTabChange("direct-download")}
                  className={`pb-1 transition-all duration-300 text-center relative ${
                    activeTab === "direct-download"
                      ? "text-blue-600 scale-105"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 scale-100"
                  }`}
                >
                  Direct Download
                </button>
              </div>

              {/* Tab Content - 内容区域 */}
              <div className="space-y-4">
                {getTabContent().map((item, index) => (
                  <div key={index} className="space-y-3">
                    {/* 代码块区域 */}
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                      <code className="text-sm text-gray-800 dark:text-gray-100 font-mono break-all">
                        {formatCommand(item.url, item.type)}
                      </code>
                    </div>
                    
                    {/* 按钮区域 */}
                    <div>
                      {item.type === 'direct-download' ? (
                        // Direct Download: 两个按钮水平排列
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleCopy(item.url, index)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                              {copiedIndex === index ? '已复制' : '复制'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpen(item.url)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-sm font-medium">打开</span>
                          </button>
                        </div>
                      ) : (
                        // Git Clone & Wget/Curl: 只有复制按钮
                        <button
                          onClick={() => handleCopy(formatCommand(item.url, item.type), index)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">
                            {copiedIndex === index ? '已复制' : '复制'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waline 评论区域 */}
          {!isLoading && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <WalineComment 
                serverURL={WALINE_SERVER_URL}
                path="/github"
                lang="zh-CN"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
