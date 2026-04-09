import type { Metadata } from "next";
import "./globals.css";
import UmamiAnalytics from "@/components/UmamiAnalytics";

export const metadata: Metadata = {
  title: "GitHub 文件下载加速代理 - GitHub Proxy",
  description: "GitHub 文件下载加速代理服务，支持API、Git Clone、Releases、Archive、Gist、Raw等资源加速下载，解决 GitHub 文件访问慢的问题。",
  keywords: "github代理, github加速, github镜像, github加速站, github代理加速, github下载加速, releases下载加速, raw加速, ghproxy, github proxy, github, proxy, git, ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <UmamiAnalytics />
      </body>
    </html>
  );
}
