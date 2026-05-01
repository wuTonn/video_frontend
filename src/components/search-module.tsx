import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { debounce } from "lodash"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, CircleX } from "lucide-react"
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"))
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export function SearchModule({ transcripts, onSeek }: SearchModuleProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []

    const lowerQuery = debouncedQuery.toLowerCase()
    return transcripts.filter((item) =>
      item.text.toLowerCase().includes(lowerQuery),
    )
  }, [debouncedQuery, transcripts])

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), 300),
    [],
  )

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setOpen(newValue.trim().length > 0)
    debouncedSetQuery(newValue)
  }, [debouncedSetQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      debouncedSetQuery.cancel()
    }
  }, [debouncedSetQuery])

  const handleResultClick = (timestamp: number) => {
    onSeek(timestamp)
    setOpen(false)
    setQuery("")
    setDebouncedQuery("")
    debouncedSetQuery.cancel()
    inputRef.current?.focus()
  }

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    setOpen(false)
    debouncedSetQuery.cancel()
    inputRef.current?.focus()
  }, [debouncedSetQuery])

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder="Search transcript..."
        value={query}
        onChange={handleQueryChange}
        onFocus={() => query.trim() && setOpen(true)}
        className="pl-10"
        disabled={transcripts.length === 0}
      />
      {query.trim() && (
        <Button
          variant="link"
          size="icon-lg"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault()
            handleClear()
          }}
        >
          <CircleX className="h-4 w-4" />
        </Button>
      )}

      {open && query.trim() && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {searchResults.length > 0 ? (
            <ScrollArea className="my-4 h-[300px]">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResultClick(result.timestamp)
                  }}
                  className="flex w-full cursor-pointer flex-col items-start gap-1 px-3 py-2 text-left hover:bg-accent/20"
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {formatTimestamp(result.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">{result.speaker}</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {highlightText(result.text, query)}
                  </p>
                </button>
              ))}
            </ScrollArea>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              No matching transcript segments.
            </div>
          )}
          <div className="border-t border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
