import { MetadataRoute } from 'next'

/**
 * 生成网站的 sitemap.xml
 * Next.js 会自动生成 sitemap.xml 文件
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://github.akams.cn' // 请替换为你的实际域名

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
