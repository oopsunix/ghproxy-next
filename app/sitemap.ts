import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export const dynamic = 'force-static';

/**
 * 生成网站的 sitemap.xml
 * Next.js 会自动生成 sitemap.xml 文件
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // 定义所有静态页面路由
  const routes = [
    '',
    '/about',
    '/contact',
    '/disclaimer',
    '/privacy',
    '/terms',
  ]

  // 生成 sitemap 条目
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))
}
