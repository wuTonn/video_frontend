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

export interface EventItem {
  window_id: number
  start: number
  end: number
  title: string
  summary: string
  event_type: string
}

export interface UploadResponse {
  task_id: string;
  video_duration?: number;
  text: string;
  segments: Segment[];
  grouped_segments?: GroupedSegments;
  summary: string;
  keywords: string[]
  keyframes?: Keyframe[]
  events?: EventItem[]
}

export interface TaskStatusResponse {
  task_id: string
  filename?: string
  status: "queued" | "processing" | "completed" | "failed"
  current_step: number
  total_steps: number
  message: string
  progress: number
  result?: UploadResponse | null
  error?: string | null
  created_at?: string
  updated_at?: string
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
  events: EventItem[]
}

export type AnalysisNavigationState = AnalysisSessionData & {
  videoSrc: string | null
}
