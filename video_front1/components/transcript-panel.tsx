"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface TranscriptItem {
  id: number
  timestamp: number
  speaker: string
  emotion: string
  text: string
}

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

function getEmotionIcon(emotion: string): string {
  const emotions: Record<string, string> = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    angry: "😠",
    surprised: "😮",
  }
  return emotions[emotion] || "😐"
}

export function TranscriptPanel({ transcripts, currentTime, onSeek }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  // Find the current transcript item
  const currentIndex = transcripts.findIndex((t, i) => {
    const nextT = transcripts[i + 1]
    return currentTime >= t.timestamp && (!nextT || currentTime < nextT.timestamp)
  })

  // Auto-scroll to current transcript
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
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
        <ScrollArea className="h-[400px] px-4 pb-4" ref={scrollRef}>
          <div className="space-y-2">
            {transcripts.map((item, index) => {
              const isActive = index === currentIndex
              
              return (
                <div
                  key={item.id}
                  ref={isActive ? activeRef : null}
                  onClick={() => onSeek(item.timestamp)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3 transition-all hover:bg-muted/50",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:border-border"
                  )}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {item.speaker}
                    </span>
                    <span className="text-sm" title={item.emotion}>
                      {getEmotionIcon(item.emotion)}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.text}
                  </p>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
