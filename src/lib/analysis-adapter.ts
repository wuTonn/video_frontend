import { buildMediaUrl, buildUploadedVideoUrl } from "@/api/video"
import type {
  AnalysisNavigationState,
  AnalysisSessionData,
  TaskStatusResponse,
  TranscriptItem,
  UploadResponse,
} from "@/types/video"
import { segmentsToTranscripts } from "@/lib/upload-response"

const PLACEHOLDER_KEYWORDS = ["Pending", "Analysis"]
const EMPTY_TRANSCRIPT: TranscriptItem[] = [
  {
    id: 1,
    timestamp: 0,
    speaker: "Unknown",
    emotion: "neutral",
    text: "(No transcript available)",
  },
]

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function buildAnalysisSessionData(
  data: UploadResponse,
  task: TaskStatusResponse,
): AnalysisSessionData {
  let summaryText = data.summary
  if (!summaryText && data.text?.trim()) {
    summaryText = data.text.trim().slice(0, 1200)
  }
  if (!summaryText) summaryText = "(No summary available)"

  const keywords =
    Array.isArray(data.keywords) && data.keywords.length > 0
      ? data.keywords
      : PLACEHOLDER_KEYWORDS

  const flatSegments =
    data.grouped_segments && data.grouped_segments.length > 0
      ? data.grouped_segments.flat()
      : (data.segments ?? [])

  let transcripts = segmentsToTranscripts(flatSegments)
  if (transcripts.length === 0 && data.text?.trim()) {
    transcripts = [
      { id: 1, timestamp: 0, speaker: "Speaker", emotion: "neutral", text: data.text.trim() },
    ]
  }
  if (transcripts.length === 0) {
    transcripts = EMPTY_TRANSCRIPT
  }

  const keyframes = (data.keyframes ?? []).map((kf, i) => ({
    id: kf.id ?? i + 1,
    timestamp: kf.timestamp,
    thumbnail: kf.thumbnail ? buildMediaUrl(kf.thumbnail) : "",
    visual_caption: kf.visual_caption,
  }))

  const events = (data.events ?? []).map((event, i) => ({
    window_id: event.window_id ?? i + 1,
    start: event.start ?? 0,
    end: event.end ?? event.start ?? 0,
    title: event.title ?? `Event ${i + 1}`,
    summary: event.summary ?? "",
    event_type: event.event_type ?? "other",
  }))

  const taskId = data.task_id?.trim() || task.task_id?.trim() || "local-task"
  const videoSrc = task.filename ? buildUploadedVideoUrl(taskId, task.filename) : null

  return {
    taskId,
    videoSrc,
    videoInfo: {
      filename: task.filename || "upload.mp4",
      durationSeconds: data.video_duration ?? 0,
      durationLabel: formatTimestamp(data.video_duration ?? 0),
      uploadTime: task.created_at
        ? new Date(task.created_at).toLocaleString()
        : new Date().toLocaleString(),
    },
    summary: summaryText,
    keywords,
    transcripts,
    keyframes,
    events,
  }
}

export function buildAnalysisNavigationState(
  data: AnalysisSessionData,
): AnalysisNavigationState {
  return {
    ...data,
    videoSrc: data.videoSrc ?? null,
  }
}
