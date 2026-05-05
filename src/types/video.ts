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

export interface VideoInfo {
  filename: string
  durationSeconds: number
  durationLabel: string
  uploadTime: string
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

export type TaskHistoryItem = Omit<TaskStatusResponse, "result">

export interface TranscriptItem {
  id: number
  timestamp: number
  speaker: string
  emotion: string
  text: string
}

export interface AnalysisSessionData {
  taskId: string
  videoSrc?: string | null
  videoInfo: VideoInfo
  summary: string
  keywords: string[]
  transcripts: TranscriptItem[]
  keyframes: Keyframe[]
  events: EventItem[]
}

export type AnalysisNavigationState = AnalysisSessionData & {
  videoSrc: string | null
}

export interface ReportPayload {
  filename: string
  generated_at: string
  video_info: {
    filename: string
    duration_label: string
    upload_time: string
  }
  summary: string
  keywords: string[]
  speakers: Array<{ name: string; percentage: number }>
  emotions: Array<{ name: string; value: number; color?: string }>
  events: Array<{
    window_id: number
    start: number
    end: number
    start_label: string
    end_label: string
    title: string
    summary: string
    event_type: string
  }>
  keyframes: Array<{
    id: number
    timestamp: number
    timestamp_label: string
    thumbnail: string
    visual_caption?: string
  }>
  transcripts: Array<{
    id: number
    timestamp: number
    timestamp_label: string
    speaker: string
    emotion: string
    text: string
  }>
  options: {
    include_transcripts: boolean
  }
}
