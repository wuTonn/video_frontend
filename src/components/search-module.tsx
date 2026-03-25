import { useEffect, useMemo, useRef, useState, useCallback } from "react"
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

// export function SearchModule({ transcripts, onSeek }: SearchModuleProps) {
//   const [query, setQuery] = useState("")
//   const [open, setOpen] = useState(false)
//   const [debouncedQuery, setDebouncedQuery] = useState("")
//   const inputRef = useRef<HTMLInputElement | null>(null)

//   const searchResults = useMemo(() => {
//     if (!debouncedQuery.trim()) return []

//     const lowerQuery = debouncedQuery.toLowerCase()
//     return transcripts.filter((t) =>
//       t.text.toLowerCase().includes(lowerQuery)
//     )
//   }, [debouncedQuery, transcripts])

//   const debouncedSetQuery = useCallback(
//     debounce((value: string) => {
//       setDebouncedQuery(value)
//     }, 300),
//     []
//   )

//   const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = e.target.value
//     setQuery(newValue)
//     setOpen(newValue.trim().length > 0)
//     debouncedSetQuery(newValue)
//   }, [debouncedSetQuery])

//   // 清理防抖函数
//   useEffect(() => {
//     return () => {
//       debouncedSetQuery.cancel()
//     }
//   }, [debouncedSetQuery])

//   const handleResultClick = (timestamp: number) => {
//     onSeek(timestamp)
//     setOpen(false)
//     setDebouncedQuery("")
//     debouncedSetQuery.cancel() // 取消待执行的防抖
//   }

//   const handleClear = useCallback(() => {
//     setQuery("")
//     setDebouncedQuery("")
//     setOpen(false)
//     debouncedSetQuery.cancel()
//   }, [debouncedSetQuery])

//   return (
//     <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
//       <DropdownMenuTrigger asChild>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             ref={inputRef}
//             placeholder="Search transcript..."
//             value={query}
//             onChange={handleQueryChange}
//             className="pl-10"
//           />
//           {query.trim() && (
//             <Button variant="link" size="icon-lg" className="absolute right-3 top-1/2 -translate-y-1/2 focus:text cursor-pointer" onClick={handleClear}>
//               <CircleX className="h-4 w-4" />
//             </Button>
//           )}
//         </div>
//       </DropdownMenuTrigger>

//       <DropdownMenuContent
//         className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-0"
//         align="start"
//         sideOffset={4}
//       >
//         {query.trim() && (
//           <>
//             {searchResults.length > 0 ? (
//               <div className="max-h-[300px] overflow-y-auto">
//                 {searchResults.map((result) => (
//                   <DropdownMenuItem
//                     key={result.id}
//                     onClick={() => handleResultClick(result.timestamp)}
//                     className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer"
//                   >
//                     <div className="flex items-center gap-2 w-full">
//                       <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
//                         {formatTimestamp(result.timestamp)}
//                       </span>
//                       <span className="text-xs text-muted-foreground">
//                         {result.speaker}
//                       </span>
//                     </div>
//                     <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
//                       {highlightText(result.text, query)}
//                     </p>
//                   </DropdownMenuItem>
//                 ))}
//               </div>
//             ) : (
//               <div className="px-3 py-4 text-center text-sm text-muted-foreground">
//                 未找到相关结果
//               </div>
//             )}

//             {/* 可选：显示结果数量 */}
//             <div className="border-t border-border px-3 py-2">
//               <p className="text-xs text-muted-foreground">
//                 {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
//               </p>
//             </div>
//           </>
//         )}

//         {!query.trim() && (
//           <div className="px-3 py-4 text-center text-sm text-muted-foreground">
//             输入关键词开始搜索
//           </div>
//         )}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }


export function SearchModule({ transcripts, onSeek }: SearchModuleProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []

    const lowerQuery = debouncedQuery.toLowerCase()
    return transcripts.filter((t) =>
      t.text.toLowerCase().includes(lowerQuery)
    )
  }, [debouncedQuery, transcripts])

  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value)
    }, 300),
    []
  )

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    setOpen(newValue.trim().length > 0)
    debouncedSetQuery(newValue)
  }, [debouncedSetQuery])

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleResultClick = (timestamp: number) => {
    onSeek(timestamp)
    setOpen(false)
    setQuery("")
    setDebouncedQuery("")
    debouncedSetQuery.cancel()
    // 保持焦点在输入框
    inputRef.current?.focus()
  }

  const handleClear = useCallback(() => {
    setQuery("")
    setDebouncedQuery("")
    setOpen(false)
    debouncedSetQuery.cancel()
  }, [debouncedSetQuery])

  return (
    // ✅ 用普通 div 替代 DropdownMenu，自己管理开关
    <div ref={containerRef} className="relative">
      {/* Search Input - 不再是 Trigger */}
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
      <Input
        ref={inputRef}
        placeholder="Search transcript..."
        value={query}
        onChange={handleQueryChange}
        onFocus={() => query.trim() && setOpen(true)}
        className="pl-10"
      />
      {query.trim() && (
        <Button
          variant="link"
          size="icon-lg"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
          // ✅ 用 onMouseDown + preventDefault 防止点击时 Input 失焦
          onMouseDown={(e) => {
            e.preventDefault()
            handleClear()
            inputRef.current?.focus()
          }}
        >
          <CircleX className="h-4 w-4" />
        </Button>
      )}

      {/* 自定义下拉结果面板 */}
      {open && query.trim() && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {searchResults.length > 0 ? (
            <ScrollArea className="h-[300px] my-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}

                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResultClick(result.timestamp)
                  }}
                  className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer hover:bg-accent/20"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {formatTimestamp(result.timestamp)}
                    </span>
                    <span className="text-xs text-muted-foreground">{result.speaker}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {highlightText(result.text, query)}
                  </p>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              未找到相关结果
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