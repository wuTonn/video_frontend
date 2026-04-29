import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/video"

interface EventTimelinePanelProps {
  events: EventItem[]
  currentTime: number
  onSeek: (time: number) => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function toEventTypeLabel(eventType: string): string {
  const value = eventType.trim()
  if (!value) return "Event"
  return value.slice(0, 1).toUpperCase() + value.slice(1).replaceAll("_", " ")
}

export function EventTimelinePanel({ events, currentTime, onSeek }: EventTimelinePanelProps) {
  if (events.length === 0) {
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No event summary available.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Event Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[380px] px-4 pb-4">
          <div className="space-y-3">
            {events.map((event) => {
              const isActive = currentTime >= event.start && currentTime <= event.end

              return (
                <button
                  key={`${event.window_id}-${event.start}-${event.end}`}
                  type="button"
                  onClick={() => onSeek(event.start)}
                  className={cn(
                    "w-full rounded-lg border p-4 text-left transition-all hover:bg-muted/40",
                    isActive ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {formatTimestamp(event.start)} - {formatTimestamp(event.end)}
                    </span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {toEventTypeLabel(event.event_type)}
                    </span>
                  </div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">
                    {event.title || "Event"}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {event.summary}
                  </p>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
