import type { Segment, TranscriptItem } from "@/types/video"

/**
 * 将后端 `summary_keywords` 拆成摘要与关键词（支持「摘要：」「关键词：」等简单格式，否则整段作摘要）。
 */
export function parseSummaryKeywords(raw: string): {
  summary: string
  keywords: string[]
} {
  const trimmed = raw.trim()
  if (!trimmed) return { summary: "", keywords: [] }

  const kwPattern = /(?:关键词|Keywords|标签|Topics?)[:：]\s*(.+)$/ims
  const m = trimmed.match(kwPattern)
  if (m && m.index !== undefined) {
    const before = trimmed
      .slice(0, m.index)
      .replace(/^(?:摘要|Summary)[:：]?\s*/ims, "")
      .trim()
    const kwPart = m[1].trim()
    const keywords = kwPart
      .split(/[,，、;；\n|]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    return {
      summary: before || trimmed.slice(0, m.index).trim(),
      keywords,
    }
  }

  const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean)
  if (lines.length >= 2) {
    const last = lines[lines.length - 1]
    if (last.length < 200 && /[,，、]/.test(last)) {
      const kws = last.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
      if (kws.length >= 2) {
        return {
          summary: lines.slice(0, -1).join("\n"),
          keywords: kws,
        }
      }
    }
  }

  return { summary: trimmed, keywords: [] }
}

export function segmentsToTranscripts(segments: Segment[]): TranscriptItem[] {
  return segments.map((seg, i) => ({
    id: i + 1,
    timestamp: seg.start,
    speaker: "Speaker",
    emotion: "neutral",
    text: seg.text,
  }))
}
