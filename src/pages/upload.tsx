import { useState, useCallback, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadVideo } from "@/api/video"
import { saveAnalysisSession } from "@/lib/analysis-session"
import { segmentsToTranscripts } from "@/lib/upload-response"
import type { AnalysisNavigationState, AnalysisSessionData, TranscriptItem } from "@/types/video"
import {
  Upload,
  FileVideo,
  Check,
  Loader2,
  CloudUpload,
  AudioLines,
  MessageSquare,
  Users,
  Heart,
  Image,
  Sparkles,
  FileText,
  AlertCircle,
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

// 每个步骤的预估耗时（毫秒），用于在等待后端期间推进假进度
const STEP_DURATIONS = [0, 2000, 8000, 12000, 8000, 6000, 4000, 3000]

const PLACEHOLDER_KEYWORDS = ["关键词占位", "待后端返回"]
const EMPTY_TRANSCRIPT: TranscriptItem[] = [
  {
    id: 1,
    timestamp: 0,
    speaker: "—",
    emotion: "neutral",
    text: "（暂无字幕分段）",
  },
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // FIX 1: 用 ref 追踪 blob URL，确保在组件卸载或错误时释放
  const videoSrcRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
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

  const startProcessing = useCallback(async () => {
    if (!file) return

    setError(null)
    setIsProcessing(true)
    setCurrentStep(1)

    // FIX 1: 释放上一次遗留的 blob URL
    if (videoSrcRef.current) {
      URL.revokeObjectURL(videoSrcRef.current)
    }
    videoSrcRef.current = URL.createObjectURL(file)

    // FIX 2: 在等待后端期间按预估耗时推进步骤，给用户真实的进度反馈
    let stepIndex = 2
    const stepTimer = setInterval(() => {
      if (stepIndex <= processingSteps.length) {
        setCurrentStep(stepIndex)
        stepIndex++
      } else {
        clearInterval(stepTimer)
      }
      // 用当前步骤的预估耗时作为间隔；简单起见取平均值
    }, STEP_DURATIONS.reduce((a, b) => a + b, 0) / (processingSteps.length - 1))

    try {
      const data = await uploadVideo(file)

      // 后端已返回，清除假进度定时器并推进到最后一步
      clearInterval(stepTimer)
      setCurrentStep(processingSteps.length)

      console.log(data.segments)

      let summaryText = data.summary
      if (!summaryText && data.text?.trim()) {
        summaryText = data.text.trim().slice(0, 1200)
      }
      if (!summaryText) summaryText = "（暂无摘要）"

      const keywords =
        Array.isArray(data.keywords) && data.keywords.length > 0
          ? data.keywords
          : PLACEHOLDER_KEYWORDS

      // FIX 3: grouped_segments 为空数组时也降级到 segments，避免丢失数据
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

      const sessionData: AnalysisSessionData = {
        taskId: data.task_id?.trim() || "local-task",
        summary: summaryText,
        keywords,
        transcripts,
        keyframes,
      }

      saveAnalysisSession(sessionData)

      const navState: AnalysisNavigationState = {
        ...sessionData,
        videoSrc: videoSrcRef.current,
      }

      // FIX 1: 导航后将 ref 置空，生命周期转移给分析页
      videoSrcRef.current = null

      navigate("/analysis", { state: navState })
    } catch (e) {
      clearInterval(stepTimer)

      // FIX 1: 发生错误时立即释放 blob URL
      if (videoSrcRef.current) {
        URL.revokeObjectURL(videoSrcRef.current)
        videoSrcRef.current = null
      }

      const message =
        e != null && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "上传或分析失败，请检查网络与后端服务。"
      setError(message)
      setIsProcessing(false)
      setCurrentStep(0)
    }
  }, [file, navigate])

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

            {/* Upload Area */}
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
                      <p className="font-medium text-foreground">
                        Drag and drop your video here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: MP4, MOV, AVI, MKV, WebM
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Start Analysis Button */}
            {file && !isProcessing && (
              <Button onClick={startProcessing} className="w-full gap-2" size="lg">
                <Sparkles className="h-5 w-5" />
                Start Analysis
              </Button>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 pb-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-medium text-foreground">Processing your video...</span>
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
