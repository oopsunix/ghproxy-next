/**
 * 网站核心元数据配置
 */
export const siteConfig = {
  name: "GitHub Proxy",
  altName: "GHProxy",
  description: "GitHub 文件加速下载服务，支持 Release, Source, Raw, Git Clone 等多种加速方式。",
  keywords: ["github代理", "github加速", "github镜像", "github加速站", "github代理加速", "github下载加速", "releases下载加速", "raw加速", "ghproxy", "github proxy", "github", "proxy", "git"],
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://github.akams.cn",
  ogImage: "https://cdn.akams.cn/img/260514162200257-c72107d260d76574.webp",
  links: {
    github: "https://github.com/oopsunix/ghproxy-next",
    donate: "https://akams.cn/donate",
    contact: "http://github.akams.cn/contact",
  },
  author: {
    name: "oopsunix",
    link: "https://github.com/oopsunix",
  },
};

export type SiteConfig = typeof siteConfig;
