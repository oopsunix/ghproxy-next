import type { Metadata } from "next";
import { preconnect } from "react-dom";
import "./globals.css";
import UmamiAnalytics from "@/components/UmamiAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://github.akams.cn"),
  title: {
    default: "GitHub 文件下载加速代理 - GitHub Proxy",
    template: "%s | GitHub Proxy"
  },
  description: "GitHub 文件下载加速代理服务，支持API、Git Clone、Releases、Archive、Gist、Raw等资源加速下载，解决 GitHub 文件访问慢的问题。",
  keywords: ["github代理", "github加速", "github镜像", "github加速站", "github代理加速", "github下载加速", "releases下载加速", "raw加速", "ghproxy", "github proxy", "github", "proxy", "git"],
  authors: [{ name: "OopsUnix" }],
  creator: "OopsUnix",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://github.akams.cn",
    title: "GitHub 文件下载加速代理 - GitHub Proxy",
    description: "GitHub 文件下载加速代理服务，解决 GitHub 文件访问慢的问题，提升开发者体验。",
    siteName: "GitHub Proxy",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub 文件下载加速代理 - GitHub Proxy",
    description: "GitHub 文件下载加速代理服务，支持多种资源加速下载。",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 使用 React 19 指令式 API 进行预连接
  preconnect("https://cdn.akams.cn", { crossOrigin: 'anonymous' });
  preconnect("https://gh.llkk.cc", { crossOrigin: 'anonymous' });

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {/* 结构化数据 (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GitHub Proxy",
              "url": "https://github.akams.cn",
              "description": "GitHub 文件下载加速代理服务，支持 API、Git Clone、Releases、Raw 等资源加速。",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://github.akams.cn/?url={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "GitHub Proxy",
              "operatingSystem": "All",
              "applicationCategory": "UtilitiesApplication",
              "description": "提供 GitHub 资源的镜像加速下载服务。",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CNY"
              }
            })
          }}
        />
        {children}
        <UmamiAnalytics />
      </body>
    </html>
  );
}
