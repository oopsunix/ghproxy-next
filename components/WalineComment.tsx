"use client";

// ============================================================
// Imports
// ============================================================
import { useEffect, useRef } from "react";
import { init } from "@waline/client";
import "@waline/client/style";

// ============================================================
// 类型定义
// ============================================================
interface WalineCommentProps {
  /**
   * Waline 服务器地址
   */
  serverURL: string;
  /**
   * 评论路径标识
   * 默认使用当前页面路径
   */
  path?: string;
  /**
   * 评论区域语言
   * 默认为 zh-CN
   */
  lang?: string;
}

// ============================================================
// Component
// ============================================================
/**
 * Waline 评论组件
 * 支持深色模式自动切换
 */
export default function WalineComment({ 
  serverURL, 
  path = "/", 
  lang = "zh-CN" 
}: WalineCommentProps) {
  const walineInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化 Waline
    walineInstanceRef.current = init({
      el: containerRef.current,
      serverURL,
      path,
      lang,
      dark: 'html[class~="dark"]', // 深色模式检测，匹配html标签的dark class
      pageSize: 10, // 评论列表分页，每页条数
      reaction: [
        // 为文章增加表情互动功能
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_heart_eyes.png",
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_thumbsup.png",
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_zhoumei.png",
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_grievance.png",
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_dizzy_face.png",
        "https://cdn.akams.cn/jsd/npm/@waline/emojis@1.1.0/bilibili/bb_slap.png",
      ],
      locale: {
        placeholder: "请留言。(填写邮箱可在被回复时收到邮件提醒)",
        reaction0: "非常有用",
        reaction1: "有帮助",
        reaction2: "一般",
        reaction3: "无帮助",
        reaction4: "看不懂",
        reaction5: "有错误",
        reactionTitle: "本站内容对你有帮助吗？",
        sofa: "还没有人留言哦！快来抢沙发吧~",
        comment: "留言",
      },
      emoji: [
        'https://cdn.akams.cn/jsd/gh/norevi/waline-blobcatemojis@1.0/blobs',
        "https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/bmoji",
        "https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/bilibili",
        "https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/weibo",
        'https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/qq',
        'https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/tieba',
        'https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/alus',
        'https://cdn.akams.cn/jsd/gh/walinejs/emojis@1.4.0/hoyoverse-hi3'
      ],
      imageUploader: false, // 禁用图片上传
      search: false, // 禁用gif表情包搜索
    });

    // 清理函数
    return () => {
      if (walineInstanceRef.current?.destroy) {
        walineInstanceRef.current.destroy();
      }
    };
  }, [serverURL, path, lang]);

  return (
    <div 
      ref={containerRef} 
      className="waline-container"
    />
  );
}
