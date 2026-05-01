import { useCallback, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { VideoPlayer } from "@/components/video-player"
import { AnalysisCards } from "@/components/analysis-cards"
import { SearchModule } from "@/components/search-module"
import { TranscriptPanel } from "@/components/transcript-panel"
import { KeyframePanel } from "@/components/keyframe-panel"
import { EventTimelinePanel } from "@/components/event-timeline-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Upload } from "lucide-react"
import { loadAnalysisSession } from "@/lib/analysis-session"
import type {
  AnalysisNavigationState,
  AnalysisSessionData,
  TranscriptItem,
} from "@/types/video"

const EMPTY_SUMMARY = "No summary available."
const EMPTY_KEYWORDS: string[] = []
const EMPTY_TRANSCRIPTS: TranscriptItem[] = []

const EMOTION_COLOR: Record<string, string> = {
  happy: "oklch(0.7 0.15 160)",
  neutral: "oklch(0.65 0.05 250)",
  sad: "oklch(0.55 0.22 255)",
  surprised: "oklch(0.75 0.18 80)",
  angry: "oklch(0.62 0.22 25)",
  fear: "oklch(0.6 0.12 320)",
  fearful: "oklch(0.6 0.12 320)",
  disgust: "oklch(0.58 0.17 130)",
  disgusted: "oklch(0.58 0.17 130)",
}

function toTitleCase(label: string): string {
  if (!label) return label
  return label.slice(0, 1).toUpperCase() + label.slice(1).toLowerCase()
}

function normalizeEmotion(raw: string | undefined | null): string {
  const value = String(raw ?? "").trim().toLowerCase()
  return value || "neutral"
}

function normalizeSpeaker(raw: string | undefined | null): string {
  const value = String(raw ?? "").trim()
  return value || "Unknown"
}

function toPercentDistribution(
  counts: Map<string, number>,
): Array<{ key: string; percent: number }> {
  const entries = Array.from(counts.entries()).filter(([, count]) => count > 0)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total <= 0) return []

  const rounded = entries.map(([key, count]) => ({
    key,
    raw: (count / total) * 100,
    percent: Math.round((count / total) * 100),
  }))

  const diff = 100 - rounded.reduce((sum, item) => sum + item.percent, 0)
  if (diff !== 0 && rounded.length > 0) {
    let bestIndex = 0
    let bestScore = -Infinity
    for (let index = 0; index < rounded.length; index += 1) {
      const item = rounded[index]
      const score = diff > 0 ? item.raw - item.percent : item.percent - item.raw
      if (score > bestScore) {
        bestScore = score
        bestIndex = index
      }
    }
    rounded[bestIndex] = {
      ...rounded[bestIndex],
      percent: rounded[bestIndex].percent + diff,
    }
  }

  return rounded
    .map((item) => ({ key: item.key, percent: item.percent }))
    .sort((a, b) => b.percent - a.percent)
}

function resolveAnalysisRouteState(state: unknown): {
  payload: AnalysisSessionData | null
  videoSrc: string | null
} {
  const nav = state as AnalysisNavigationState | undefined
  if (nav?.taskId) {
    const { videoSrc, ...rest } = nav
    return { payload: rest, videoSrc: videoSrc ?? null }
  }
  return { payload: loadAnalysisSession(), videoSrc: null }
}

export default function AnalysisPage() {
  const location = useLocation()
  const { payload, videoSrc } = useMemo(
    () => resolveAnalysisRouteState(location.state),
    [location.state, location.key],
  )

  const summary = payload?.summary.trim() || EMPTY_SUMMARY
  const keywords = payload?.keywords.length ? payload.keywords : EMPTY_KEYWORDS
  const transcripts = payload?.transcripts.length ? payload.transcripts : EMPTY_TRANSCRIPTS
  const keyframes = payload?.keyframes ?? []
  const events = payload?.events ?? []

  const emotions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of transcripts) {
      const key = normalizeEmotion(item.emotion)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return toPercentDistribution(counts).map(({ key, percent }) => ({
      name: toTitleCase(key),
      value: percent,
      color: EMOTION_COLOR[key] ?? "oklch(0.72 0.06 260)",
    }))
  }, [transcripts])

  const speakers = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of transcripts) {
      const key = normalizeSpeaker(item.speaker)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return toPercentDistribution(counts).map(({ key, percent }) => ({
      name: key,
      percentage: percent,
    }))
  }, [transcripts])

  const [currentTime, setCurrentTime] = useState(0)

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  if (!payload) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-10">
          <Card className="border-border">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">No analysis result loaded</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload and analyze a video to view transcript, events, keyframes, and report data.
                </p>
              </div>
              <Link to="/upload">
                <Button>Upload Video</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <SearchModule transcripts={transcripts} onSeek={handleSeek} />

          <Link to="/report" state={{ videoSrc }}>
            <Button className="gap-2">
              <Download className="h-4 w-4" />
              Prepare PDF Report
            </Button>
          </Link>
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <VideoPlayer
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              src={videoSrc}
            />
          </div>

          <TranscriptPanel
            transcripts={transcripts}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>

        <div className="mb-6">
          <AnalysisCards
            summary={summary}
            keywords={keywords}
            emotions={emotions}
            speakers={speakers}
          />
        </div>

        <div className="mb-6">
          <EventTimelinePanel
            events={events}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>

        <div className="mb-6">
          <KeyframePanel
            keyframes={keyframes}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </main>
    </div>
  )
}
