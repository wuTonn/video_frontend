export interface Segment {
  start: number;
  end: number;
  text: string;
}

export interface Keyframe {
  id: number
  timestamp: number
  thumbnail: string
  // Backend 会返回用于展示/分析的视觉标签（目前前端未必使用）
  visual_tags?: string[]
}

export interface UploadResponse {
  task_id: string;
  text: string;
  segments: Segment[];
  summary_keywords: string;
  keyframes?: Keyframe[]
}

/** 字幕行（分析页 / 搜索 / 报告共用） */
export interface TranscriptItem {
  id: number
  timestamp: number
  speaker: string
  emotion: string
  text: string
}

/** 写入 sessionStorage，刷新分析页仍可显示文案与字幕（无本地视频 blob） */
export interface AnalysisSessionData {
  taskId: string
  summary: string
  keywords: string[]
  transcripts: TranscriptItem[]
  keyframes: Keyframe[]
}

/** 上传完成跳转分析页时携带（含本次上传视频的 blob URL） */
export type AnalysisNavigationState = AnalysisSessionData & {
  videoSrc: string | null
}