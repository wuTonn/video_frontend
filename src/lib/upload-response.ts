import type { Segment, TranscriptItem } from "@/types/video"

export function segmentsToTranscripts(segments: Segment[]): TranscriptItem[] {
  return segments.map((seg, i) => ({
    id: i + 1,
    timestamp: seg.start,
    speaker: seg.speaker ?? "Speaker",
    emotion: seg.emotion ?? "neutral",
    text: seg.text,
  }))
}
