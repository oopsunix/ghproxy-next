import type { Metadata } from "next";
import { preconnect } from "react-dom";
import "./globals.css";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import { siteConfig } from "@/config/site";
import { servicesConfig } from "@/config/services";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - GitHub 文件下载加速代理`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    title: `${siteConfig.name} - GitHub 文件下载加速代理`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - GitHub 文件下载加速代理`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
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
  // 使用 React 19 指令式 API 自动进行预连接
  servicesConfig.preconnect.forEach(url => {
    preconnect(url, { crossOrigin: 'anonymous' });
  });

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
              "name": siteConfig.name,
              "url": siteConfig.url,
              "description": siteConfig.description,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${siteConfig.url}/?url={search_term_string}`,
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
              "name": siteConfig.name,
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
