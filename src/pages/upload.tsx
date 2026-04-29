import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getVideoTask, uploadVideo } from "@/api/video"
import { saveAnalysisSession } from "@/lib/analysis-session"
import { segmentsToTranscripts } from "@/lib/upload-response"
import type {
  AnalysisNavigationState,
  AnalysisSessionData,
  TaskStatusResponse,
  TranscriptItem,
  UploadResponse,
} from "@/types/video"
import {
  AlertCircle,
  AudioLines,
  Check,
  CloudUpload,
  FileText,
  FileVideo,
  Heart,
  Image,
  Loader2,
  MessageSquare,
  Sparkles,
  Upload,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const processingSteps = [
  { id: 1, label: "Uploading video", icon: CloudUpload },
  { id: 2, label: "Extracting audio", icon: AudioLines },
  { id: 3, label: "Speech recognition", icon: MessageSquare },
  { id: 4, label: "Speaker diarization", icon: Users },
  { id: 5, label: "Emotion recognition", icon: Heart },
  { id: 6, label: "Keyframe extraction", icon: Image },
  { id: 7, label: "Multimodal fusion", icon: Sparkles },
  { id: 8, label: "Generating analysis results", icon: FileText },
]

const PLACEHOLDER_KEYWORDS = ["Pending", "Analysis"]
const EMPTY_TRANSCRIPT: TranscriptItem[] = [
  {
    id: 1,
    timestamp: 0,
    speaker: "Unknown",
    emotion: "neutral",
    text: "(No transcript available)",
  },
]

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [error, setError] = useState<string | null>(null)

  const videoSrcRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (videoSrcRef.current) {
        URL.revokeObjectURL(videoSrcRef.current)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }, [])

  const buildSessionData = useCallback((data: UploadResponse): AnalysisSessionData => {
    let summaryText = data.summary
    if (!summaryText && data.text?.trim()) {
      summaryText = data.text.trim().slice(0, 1200)
    }
    if (!summaryText) summaryText = "(No summary available)"

    const keywords =
      Array.isArray(data.keywords) && data.keywords.length > 0
        ? data.keywords
        : PLACEHOLDER_KEYWORDS

    const flatSegments =
      data.grouped_segments && data.grouped_segments.length > 0
        ? data.grouped_segments.flat()
        : (data.segments ?? [])

    let transcripts = segmentsToTranscripts(flatSegments)
    if (transcripts.length === 0 && data.text?.trim()) {
      transcripts = [
        { id: 1, timestamp: 0, speaker: "Speaker", emotion: "neutral", text: data.text.trim() },
      ]
    }
    if (transcripts.length === 0) {
      transcripts = EMPTY_TRANSCRIPT
    }

    const keyframes = (data.keyframes ?? []).map((kf, i) => ({
      id: kf.id ?? i + 1,
      timestamp: kf.timestamp,
      thumbnail: kf.thumbnail,
      visual_caption: kf.visual_caption,
    }))

    const events = (data.events ?? []).map((event, i) => ({
      window_id: event.window_id ?? i + 1,
      start: event.start ?? 0,
      end: event.end ?? event.start ?? 0,
      title: event.title ?? `Event ${i + 1}`,
      summary: event.summary ?? "",
      event_type: event.event_type ?? "other",
    }))

    return {
      taskId: data.task_id?.trim() || "local-task",
      summary: summaryText,
      keywords,
      transcripts,
      keyframes,
      events,
    }
  }, [])

  const handleCompletedTask = useCallback((task: TaskStatusResponse) => {
    const data = task.result
    if (!data) {
      throw new Error("Task finished without analysis result.")
    }

    const sessionData = buildSessionData(data)
    saveAnalysisSession(sessionData)

    const navState: AnalysisNavigationState = {
      ...sessionData,
      videoSrc: videoSrcRef.current,
    }

    videoSrcRef.current = null
    navigate("/analysis", { state: navState })
  }, [buildSessionData, navigate])

  const pollTaskUntilDone = useCallback(async (taskId: string) => {
    while (isMountedRef.current) {
      const task = await getVideoTask(taskId)

      if (!isMountedRef.current) {
        return
      }

      setCurrentStep(Math.max(1, task.current_step || 1))
      setStatusMessage(task.message || "")

      if (task.status === "completed") {
        handleCompletedTask(task)
        return
      }

      if (task.status === "failed") {
        throw new Error(task.error || task.message || "Analysis failed.")
      }

      await delay(2000)
    }
  }, [handleCompletedTask])

  const startProcessing = useCallback(async () => {
    if (!file) return

    setError(null)
    setIsProcessing(true)
    setCurrentStep(1)
    setStatusMessage("Uploading video.")

    if (videoSrcRef.current) {
      URL.revokeObjectURL(videoSrcRef.current)
    }
    videoSrcRef.current = URL.createObjectURL(file)

    try {
      const task = await uploadVideo(file)

      if (!isMountedRef.current) return

      setCurrentStep(Math.max(1, task.current_step || 1))
      setStatusMessage(task.message || "Task queued.")

      await pollTaskUntilDone(task.task_id)
    } catch (e) {
      if (videoSrcRef.current) {
        URL.revokeObjectURL(videoSrcRef.current)
        videoSrcRef.current = null
      }

      const message =
        e != null && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Upload or analysis failed. Please check the backend service."
      setError(message)
      setIsProcessing(false)
      setCurrentStep(0)
      setStatusMessage("")
    }
  }, [file, pollTaskUntilDone])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Upload Video</CardTitle>
            <CardDescription>
              Upload a video file to start AI-powered analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isProcessing && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : file
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <FileVideo className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">Drag and drop your video here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: MP4, MOV, AVI, MKV, WebM
                    </p>
                  </div>
                )}
              </div>
            )}

            {file && !isProcessing && (
              <Button onClick={startProcessing} className="w-full gap-2" size="lg">
                <Sparkles className="h-5 w-5" />
                Start Analysis
              </Button>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 pb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div className="text-center">
                    <div className="font-medium text-foreground">Processing your video...</div>
                    <div className="text-sm text-muted-foreground">{statusMessage}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {processingSteps.map((step) => {
                    const StepIcon = step.icon
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id

                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                          isCompleted
                            ? "border-primary/30 bg-primary/5"
                            : isCurrent
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                                ? "bg-primary/20 text-primary"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <StepIcon className="h-4 w-4" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isCompleted || isCurrent
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
