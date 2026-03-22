import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import type { TranscriptItem } from "@/types/video"

interface SearchModuleProps {
  transcripts: TranscriptItem[]
  onSeek: (time: number) => void
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${query})`, "gi"))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export function SearchModule({ transcripts, onSeek }: SearchModuleProps) {
  const [query, setQuery] = useState("")

  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const lowerQuery = query.toLowerCase()
    return transcripts.filter((t) =>
      t.text.toLowerCase().includes(lowerQuery)
    )
  }, [query, transcripts])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="h-4 w-4 text-primary" />
          Search in Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {query.trim() && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </p>

            {searchResults.length > 0 && (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => onSeek(result.timestamp)}
                      className="cursor-pointer rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:bg-muted/50"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {formatTimestamp(result.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {result.speaker}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {highlightText(result.text, query)}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
