import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface Keyframe {
  id: number
  timestamp: number
  thumbnail: string
}

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
  // Find the closest keyframe
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
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {keyframes.map((keyframe, index) => {
              const isActive = index === closestIndex && Math.abs(keyframe.timestamp - currentTime) < 10

              return (
                <div
                  key={keyframe.id}
                  onClick={() => onSeek(keyframe.timestamp)}
                  className={cn(
                    "cursor-pointer overflow-hidden rounded-lg border transition-all hover:ring-2 hover:ring-primary/50",
                    isActive
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border"
                  )}
                >
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-1 h-8 w-8 rounded bg-muted-foreground/20 flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Frame {index + 1}</span>
                    </div>
                  </div>
                  <div className="bg-card p-2 text-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatTimestamp(keyframe.timestamp)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
