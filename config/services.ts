/**
 * 第三方服务及 API 配置
 */
export const servicesConfig = {
  // GitHub 相关的服务配置
  github: {
    // API 代理接口列表（随机分配避免频率限制）
    apiBases: [
      'https://api.github.com',
      'https://gh.dpik.top/https://api.github.com',
    ],
    // 延迟检测资源配置 (图片列表)
    latencyTestImages: [
      'https://raw.githubusercontent.com/microsoft/terminal/refs/heads/main/res/terminal/images/SmallTile.scale-125.png',
      'https://raw.githubusercontent.com/microsoft/vscode/refs/heads/main/resources/linux/code.png',
      'https://raw.githubusercontent.com/facebook/react/refs/heads/main/fixtures/dom/public/favicon.ico',
      'https://raw.githubusercontent.com/python/cpython/refs/heads/main/PC/icons/python.ico'
    ],
    // 速度测试资源配置 (文件列表)
    speedTestFiles: [
      'https://github.com/microsoft/terminal/releases/download/v1.22.10731.0/Microsoft.WindowsTerminal_1.22.10731.0_x64.zip',
      'https://github.com/NVIDIA/cccl/releases/download/v3.2.0/cccl-src-v3.2.0.zip',
      'https://github.com/pypa/pip/archive/refs/tags/24.3.1.zip'
    ]
  },

  // 需要预连接的域名列表
  preconnect: [
    "https://cdn.akams.cn",
    "https://gh.llkk.cc",
  ],

  // Waline 评论系统
  waline: {
    serverUrl: "https://waline.akams.cn",
  },

  // Umami 访问统计
  umami: {
    websiteId: "daefb51d-9941-44e7-9ff5-c197263ededb",
    url: "https://umami.akams.cn/",
  },
};

export type ServicesConfig = typeof servicesConfig;
