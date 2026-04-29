export interface Segment {
  start: number;
  end: number;
  text: string;
  emotion?: string;
  speaker?: string;
}

export type GroupedSegments = Segment[][]

export interface Keyframe {
  id: number
  timestamp: number
  thumbnail: string
  visual_caption?: string
}

export interface UploadResponse {
  task_id: string;
  text: string;
  segments: Segment[];
  grouped_segments?: GroupedSegments;
  summary: string;
  keywords: string[]
  keyframes?: Keyframe[]
}

export interface TranscriptItem {
  id: number
  timestamp: number
  speaker: string
  emotion: string
  text: string
}

export interface AnalysisSessionData {
  taskId: string
  summary: string
  keywords: string[]
  transcripts: TranscriptItem[]
  keyframes: Keyframe[]
}

export type AnalysisNavigationState = AnalysisSessionData & {
  videoSrc: string | null
}
