import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TranscriptItem } from "@/types/video"

interface TranscriptPanelProps {
  transcripts: TranscriptItem[]
  currentTime: number
  onSeek: (time: number) => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function getEmotionLabel(emotion: string | undefined): string {
  const key = (emotion ?? "").toLowerCase()
  const labels: Record<string, string> = {
    happy: "Happy",
    neutral: "Neutral",
    sad: "Sad",
    angry: "Angry",
    surprised: "Surprised",
    fear: "Fear",
    disgust: "Disgust",
  }
  return labels[key] || (emotion?.trim() ? emotion.trim() : "Unknown")
}

export function TranscriptPanel({ transcripts, currentTime, onSeek }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const currentIndex = transcripts.findIndex((item, index) => {
    const next = transcripts[index + 1]
    return currentTime >= item.timestamp && (!next || currentTime < next.timestamp)
  })

  useEffect(() => {
    if (currentIndex < 0) return

    const scrollRoot = scrollRef.current
    const activeEl = activeRef.current
    const viewport = scrollRoot?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')

    if (!activeEl || !viewport) return

    const activeRect = activeEl.getBoundingClientRect()
    const viewportRect = viewport.getBoundingClientRect()
    const activeTop = activeRect.top - viewportRect.top + viewport.scrollTop
    const targetTop = activeTop - viewport.clientHeight / 2 + activeEl.offsetHeight / 2
    const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight)

    viewport.scrollTo({
      top: Math.max(0, Math.min(targetTop, maxTop)),
      behavior: "smooth",
    })
  }, [currentIndex])

  return (
    <Card className="flex h-full flex-col border-border">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4 text-primary" />
          Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[550px] px-4 pb-4" ref={scrollRef}>
          {transcripts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              No transcript segments available.
            </div>
          ) : (
            <div className="space-y-2">
              {transcripts.map((item, index) => {
                const isActive = index === currentIndex

                return (
                  <button
                    key={item.id}
                    ref={isActive ? activeRef : null}
                    type="button"
                    onClick={() => onSeek(item.timestamp)}
                    className={cn(
                      "w-full cursor-pointer rounded-lg border p-3 text-left transition-all hover:bg-muted/50",
                      isActive ? "border-primary bg-primary/5" : "border-transparent hover:border-border",
                    )}
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {item.speaker}
                      </span>
                      <span
                        className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        title={item.emotion}
                      >
                        {getEmotionLabel(item.emotion)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isActive ? "text-foreground" : "text-muted-foreground",
                    )}>
                      {item.text}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
