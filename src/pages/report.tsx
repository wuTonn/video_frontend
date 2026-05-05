import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { buildMediaUrl, downloadReportPdf } from "@/api/video"
import { loadAnalysisSession } from "@/lib/analysis-session"
import type {
  AnalysisNavigationState,
  AnalysisSessionData,
  ReportPayload,
  TranscriptItem,
} from "@/types/video"
import {
  ArrowLeft,
  Download,
  FileText,
  FileVideo,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Settings2,
  Tag,
  Users,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ReportLocationState {
  videoSrc?: string | null
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function resolveReportState(state: unknown): {
  payload: AnalysisSessionData | null
  videoSrc: string | null
} {
  const nav = state as (AnalysisNavigationState & ReportLocationState) | undefined
  const payload = loadAnalysisSession()
  return {
    payload,
    videoSrc: nav?.videoSrc ?? payload?.videoSrc ?? null,
  }
}

function toEmotionDistribution(transcripts: TranscriptItem[]) {
  const counts = new Map<string, number>()
  for (const item of transcripts) {
    const key = (item.emotion || "neutral").trim().toLowerCase() || "neutral"
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const total = transcripts.length || 1
  return Array.from(counts.entries()).map(([name, count], index) => ({
    name: name.slice(0, 1).toUpperCase() + name.slice(1),
    value: Math.round((count / total) * 100),
    color: ["#16a34a", "#2563eb", "#7c3aed", "#ea580c", "#dc2626"][index % 5],
  }))
}

function toSpeakerDistribution(transcripts: TranscriptItem[], nameMap: Record<string, string>) {
  const counts = new Map<string, number>()
  for (const item of transcripts) {
    const raw = (item.speaker || "Unknown").trim() || "Unknown"
    const key = nameMap[raw]?.trim() || raw
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const total = transcripts.length || 1
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
}

export default function ReportPage() {
  const location = useLocation()
  const { payload, videoSrc } = useMemo(() => resolveReportState(location.state), [location.state])

  const transcripts = payload?.transcripts ?? []
  const keyframes = useMemo(
    () =>
      (payload?.keyframes ?? []).map((frame) => ({
        ...frame,
        thumbnail: frame.thumbnail ? buildMediaUrl(frame.thumbnail) : "",
      })),
    [payload?.keyframes],
  )
  const events = payload?.events ?? []
  const summary = payload?.summary ?? ""
  const keywords = payload?.keywords ?? []
  const taskId = payload?.taskId ?? "unknown-task"

  const initialSpeakerNames = useMemo(() => {
    const unique = Array.from(new Set(transcripts.map((item) => item.speaker || "Unknown")))
    return Object.fromEntries(unique.map((name) => [name, name]))
  }, [transcripts])

  const [speakerNames, setSpeakerNames] = useState<Record<string, string>>(initialSpeakerNames)
  const [includeTranscripts, setIncludeTranscripts] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [selectedFrames, setSelectedFrames] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(keyframes.map((frame, index) => [frame.id, index < Math.min(4, keyframes.length)])),
  )

  const speakerRows = useMemo(
    () => toSpeakerDistribution(transcripts, speakerNames),
    [speakerNames, transcripts],
  )
  const emotionRows = useMemo(() => toEmotionDistribution(transcripts), [transcripts])
  const selectedKeyframes = useMemo(
    () => keyframes.filter((frame) => selectedFrames[frame.id]),
    [keyframes, selectedFrames],
  )

  const reportPayload = useMemo<ReportPayload>(() => {
    const generatedAt = new Date().toLocaleString()
    const speakerMap = speakerNames
    return {
      filename: `video-analysis-report-${taskId}.pdf`,
      generated_at: `Generated on ${generatedAt}`,
      video_info: {
        filename: payload?.videoInfo.filename || `${taskId}.mp4`,
        duration_label:
          payload?.videoInfo.durationLabel ||
          (transcripts.length > 0
            ? formatTimestamp(transcripts[transcripts.length - 1].timestamp)
            : "00:00"),
        upload_time: payload?.videoInfo.uploadTime || generatedAt,
      },
      summary,
      keywords,
      speakers: speakerRows,
      emotions: emotionRows,
      events: events.map((event) => ({
        ...event,
        start_label: formatTimestamp(event.start),
        end_label: formatTimestamp(event.end),
      })),
      keyframes: selectedKeyframes.map((frame) => ({
        ...frame,
        timestamp_label: formatTimestamp(frame.timestamp),
      })),
      transcripts: transcripts.map((item) => ({
        ...item,
        timestamp: item.timestamp,
        speaker: speakerMap[item.speaker] || item.speaker,
        timestamp_label: formatTimestamp(item.timestamp),
      })),
      options: {
        include_transcripts: includeTranscripts,
      },
    }
  }, [
    emotionRows,
    events,
    includeTranscripts,
    keywords,
    selectedKeyframes,
    speakerNames,
    speakerRows,
    summary,
    taskId,
    transcripts,
    payload?.videoInfo.durationLabel,
    payload?.videoInfo.filename,
    payload?.videoInfo.uploadTime,
  ])

  const handleSpeakerNameChange = (original: string, value: string) => {
    setSpeakerNames((prev) => ({
      ...prev,
      [original]: value,
    }))
  }

  const toggleFrameSelection = (frameId: number, checked: boolean) => {
    setSelectedFrames((prev) => ({
      ...prev,
      [frameId]: checked,
    }))
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const blob = await downloadReportPdf(reportPayload)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `video-analysis-report-${taskId}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  const displayTranscripts = includeTranscripts ? reportPayload.transcripts : []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/analysis" state={{ videoSrc }}>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Report Preview</h1>
              <p className="text-sm text-muted-foreground">
                Review the report content before downloading the PDF.
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={handleDownload} disabled={isDownloading || !payload}>
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating PDF..." : "Download PDF Report"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Report Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <Label>Speaker Names</Label>
                  {Object.keys(initialSpeakerNames).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No speaker data available.</p>
                  ) : (
                    Object.keys(initialSpeakerNames).map((original) => (
                      <div key={original} className="space-y-1">
                        <Label htmlFor={`speaker-${original}`}>{original}</Label>
                        <Input
                          id={`speaker-${original}`}
                          value={speakerNames[original] ?? original}
                          onChange={(e) => handleSpeakerNameChange(original, e.target.value)}
                        />
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="include-transcripts">Include transcript appendix</Label>
                    <Switch
                      id="include-transcripts"
                      checked={includeTranscripts}
                      onCheckedChange={setIncludeTranscripts}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable this to append the full transcript table at the end of the PDF.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Keyframes to show</Label>
                  <p className="text-sm text-muted-foreground">
                    Select only the screenshots you want in the report preview and PDF.
                  </p>
                  <div className="space-y-2">
                    {keyframes.map((frame) => (
                      <label
                        key={frame.id}
                        className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                      >
                        <Checkbox
                          checked={Boolean(selectedFrames[frame.id])}
                          onCheckedChange={(checked) => toggleFrameSelection(frame.id, checked === true)}
                        />
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            Frame {frame.id} · {formatTimestamp(frame.timestamp)}
                          </div>
                          <div className="text-muted-foreground">
                            {frame.visual_caption || "No description"}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileVideo className="h-5 w-5 text-primary" />
                  Video Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Filename</p>
                    <p className="font-medium">{reportPayload.video_info.filename}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{reportPayload.video_info.duration_label}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Uploaded At</p>
                    <p className="font-medium">{reportPayload.video_info.upload_time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{summary || "No summary available."}</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-5 w-5 text-primary" />
                  Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Speaker Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={speakerRows} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={110}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    Emotion Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="h-48 w-48 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={emotionRows}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={78}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {emotionRows.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {emotionRows.map((item) => (
                        <div key={item.name} className="flex items-center gap-3 text-sm">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-foreground">{item.name}</span>
                          <span className="text-muted-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Key Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No event summary available.</p>
                ) : (
                  events.map((event) => (
                    <div key={`${event.window_id}-${event.start}`} className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {formatTimestamp(event.start)} - {formatTimestamp(event.end)}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {event.event_type}
                        </span>
                      </div>
                      <h3 className="mb-1 text-sm font-semibold text-foreground">{event.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  Selected Keyframes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedKeyframes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No keyframes selected.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {selectedKeyframes.map((frame) => (
                      <div key={frame.id} className="overflow-hidden rounded-lg border border-border">
                        <div className="aspect-video bg-muted">
                          {frame.thumbnail ? (
                            <img
                              src={frame.thumbnail}
                              alt={`Frame ${frame.id}`}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="text-xs font-medium text-primary">
                            {formatTimestamp(frame.timestamp)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {frame.visual_caption || "No description"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {includeTranscripts && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Transcript Appendix
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displayTranscripts.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <div className="rounded-lg border border-border p-3">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {item.timestamp_label}
                          </span>
                          <span className="text-sm font-medium text-foreground">{item.speaker}</span>
                          <span className="text-xs text-muted-foreground">{item.emotion}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                      {index < displayTranscripts.length - 1 && <Separator className="mt-3" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
