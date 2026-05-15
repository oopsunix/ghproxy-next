import { Github, Mail, MessageCircle, Scale } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Brand Section - 左侧区域 */}
          <div>
            {/* Logo */}
            <div >
              <h3 className="font-bold text-2xl">GitHub Proxy</h3>
            </div>
            
            {/* Description */}
            <p className="max-w-xs mt-4 text-base leading-5 text-gray-500 dark:text-gray-400">
              支持 API、Git Clone、Releases、Archive、Gist、Raw 等资源下载加速，提升 GitHub 文件下载体验。
            </p>

            {/* MIT License */}
            {/* <div className="mt-4">
              <p className="flex items-center max-w-xs gap-2 font-semibold leading-5 text-gray-900 dark:text-gray-100">
                <Scale className="w-4 h-4" />
                MIT License
              </p>
              <p className="max-w-xs mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                本站所有内容均基于{" "}
                <a
                  href="https://opensource.org/license/mit"
                  target="_blank"
                  className="underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400"
                  rel="noreferrer"
                >
                  MIT 开源协议
                </a>
                {" "}发布。
              </p>
            </div> */}

            {/* Social Links */}
            <ul className="flex gap-6 mt-8 list-none">
              <li>
                <a
                  href="#"
                  rel="noopener"
                  target="_blank"
                  className="transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="sr-only">Github</span>
                  <Github className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  rel="noopener"
                  target="_blank"
                  className="transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="sr-only">Telegram</span>
                  <MessageCircle className="w-6 h-6" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  rel="noopener"
                  target="_blank"
                  className="transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <span className="sr-only">Email</span>
                  <Mail className="w-6 h-6" />
                </a>
              </li>
            </ul>
          </div>

          {/* Links Section - 右侧多列 */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-4">
            {/* 友情链接 */}
            <div>
              <p className="font-semibold dark:text-white">友情链接</p>
              <nav aria-label="Footer Navigation - Services" className="mt-6">
                <ul className="space-y-4 text-sm list-none">
                  <li>
                    <a
                      href="#"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      GitHub Proxy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      Docker Proxy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      KMS Activator
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      Docker Relay Service
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 相关资源 */}
            <div>
              <p className="font-semibold dark:text-white">相关资源</p>
              <nav aria-label="Footer Navigation - Resources" className="mt-6">
                <ul className="space-y-4 text-sm list-none">
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                      rel="noreferrer"
                    >
                      GitHub.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://docs.github.com"
                      target="_blank"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                      rel="noreferrer"
                    >
                      GitHub Docs
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 关于我们 */}
            <div>
              <p className="font-semibold dark:text-white">关于我们</p>
              <nav aria-label="Footer Navigation - Information" className="mt-6">
                <ul className="space-y-4 text-sm list-none">
                  <li>
                    <a
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                      href="/about"
                    >
                      关于项目
                    </a>
                  </li>
                  <li>
                    <a
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                      href="/contact"
                    >
                      反馈建议
                    </a>
                  </li>
                  <li>
                    <a
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                      href="/contact"
                    >
                      报告问题
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            {/* 法律信息 */}
            <div>
              <p className="font-semibold dark:text-white">法律信息</p>
              <nav aria-label="Footer Navigation - Legal" className="mt-6">
                <ul className="space-y-4 text-sm list-none">
                  <li>
                    <a
                      href="/terms"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      服务条款
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      隐私政策
                    </a>
                  </li>
                  <li>
                    <a
                      href="/disclaimer"
                      className="transition text-gray-500 dark:text-gray-400 hover:opacity-75"
                    >
                      免责声明
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2026 • HubP All rights reserved.</p>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <a href="https://icp.gov.moe/?keyword=20251215" target="_blank" className="hover:text-gray-900 dark:hover:text-white transition-colors">萌ICP备20251215号</a>
              <span className="hidden sm:inline">|</span>
              <a href="https://icp.felicity.land/?keyword=20251111" target="_blank" className="hover:text-gray-900 dark:hover:text-white transition-colors">幸ICP备20251111号</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
