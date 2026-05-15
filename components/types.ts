// ============================================================
// 类型定义
// ============================================================

export interface DomainNode {
  value: string;
  label: string;
  latency: string;
  speed: string;
}

export interface ReleaseAsset {
  name: string;
  size: number;
  download_count: number;
  updated_at: string;
  browser_download_url: string;
}

export interface Release {
  name: string;
  tag_name: string;
  published_at: string;
  assets: ReleaseAsset[];
  html_url: string;
}

export interface ReleasesListViewProps {
  releases: Release[];
  repoName: string;
  selectedDomain: string; // 当前选择的代理节点
}
