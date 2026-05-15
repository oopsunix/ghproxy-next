'use client';

import Script from 'next/script';
import { servicesConfig } from "@/config/services";

/**
 * Umami 访问统计组件
 * 配置位于 config/services.ts 中的 umami
 */
export default function UmamiAnalytics() {
  const { websiteId, url } = servicesConfig.umami;
  
  // 如果未配置 Website ID，则不渲染统计脚本
  if (!websiteId) {
    return null;
  }

  return (
    <Script
      async
      src={`${url}script.js`}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
