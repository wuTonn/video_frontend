import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Keyframe } from "@/types/video"

interface KeyframePanelProps {
  keyframes: Keyframe[]
  currentTime: number
  onSeek: (time: number) => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function KeyframePanel({ keyframes, currentTime, onSeek }: KeyframePanelProps) {
  if (keyframes.length === 0) {
    return (
      <Card className="flex h-full flex-col border-border">
        <CardHeader className="flex-shrink-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="h-4 w-4 text-primary" />
            Keyframes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No keyframes available.
          </div>
        </CardContent>
      </Card>
    )
  }

  const closestIndex = keyframes.reduce((prev, curr, index) => {
    const prevDiff = Math.abs(keyframes[prev].timestamp - currentTime)
    const currDiff = Math.abs(curr.timestamp - currentTime)
    return currDiff < prevDiff ? index : prev
  }, 0)

  return (
    <Card className="flex h-full flex-col border-border">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Image className="h-4 w-4 text-primary" />
          Keyframes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[660px] px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {keyframes.map((keyframe, index) => {
              const isActive = index === closestIndex && Math.abs(keyframe.timestamp - currentTime) < 10

              return (
                <button
                  key={keyframe.id}
                  type="button"
                  onClick={() => onSeek(keyframe.timestamp)}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-lg border text-left transition-all hover:ring-2 hover:ring-primary/50",
                    isActive ? "border-primary ring-2 ring-primary/30" : "border-border",
                  )}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    {keyframe.thumbnail ? (
                      <img
                        src={keyframe.thumbnail}
                        alt={`Frame ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded bg-muted-foreground/20">
                            <Image className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">Frame {index + 1}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 bg-card p-2">
                    <span className="text-xs font-medium text-primary">
                      {formatTimestamp(keyframe.timestamp)}
                    </span>
                    {keyframe.visual_caption ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {keyframe.visual_caption}
                      </p>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
