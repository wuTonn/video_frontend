import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, Clock, Eye, FileVideo, History, Loader2, RefreshCw, Upload } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getVideoTask, getVideoTasks } from "@/api/video"
import { buildAnalysisNavigationState, buildAnalysisSessionData } from "@/lib/analysis-adapter"
import { saveAnalysisSession } from "@/lib/analysis-session"
import { cn } from "@/lib/utils"
import type { TaskHistoryItem, TaskStatusResponse } from "@/types/video"

const STATUS_LABEL: Record<TaskHistoryItem["status"], string> = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
}

const STATUS_CLASS: Record<TaskHistoryItem["status"], string> = {
  queued: "border-sky-200 bg-sky-50 text-sky-700",
  processing: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
}

function formatDate(value?: string): string {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function toHistoryItem(task: TaskStatusResponse): TaskHistoryItem {
  const { result: _result, ...item } = task
  return item
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const data = await getVideoTasks()
      setTasks(data)
    } catch (e) {
      const message =
        e != null && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Unable to load task history."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const replaceTask = useCallback((task: TaskStatusResponse) => {
    setTasks((prev) => prev.map((item) => (item.task_id === task.task_id ? toHistoryItem(task) : item)))
  }, [])

  const handleOpenTask = useCallback(
    async (taskId: string) => {
      setError(null)
      setLoadingTaskId(taskId)
      try {
        const task = await getVideoTask(taskId)
        replaceTask(task)

        if (task.status !== "completed") {
          return
        }

        if (!task.result) {
          throw new Error("Task finished without analysis result.")
        }

        const sessionData = buildAnalysisSessionData(task.result, task)
        saveAnalysisSession(sessionData)
        navigate("/analysis", { state: buildAnalysisNavigationState(sessionData) })
      } catch (e) {
        const message =
          e != null && typeof e === "object" && "message" in e
            ? String((e as { message: unknown }).message)
            : "Unable to load task."
        setError(message)
      } finally {
        setLoadingTaskId(null)
      }
    },
    [navigate, replaceTask],
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <History className="h-6 w-6 text-primary" />
              History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Load previous uploads and analysis results from backend media storage.
            </p>
          </div>

          <Button variant="outline" className="gap-2" onClick={loadTasks} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <Card className="border-border">
            <CardContent className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading history...
            </CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileVideo className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">No history yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload and analyze a video to create the first history record.
                </p>
              </div>
              <Link to="/upload">
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              const progressValue = Math.round((task.progress ?? 0) * 100)
              const isTaskLoading = loadingTaskId === task.task_id
              const canOpenResult = task.status === "completed"
              const canRefreshStatus = task.status === "queued" || task.status === "processing"

              return (
                <Card key={task.task_id} className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <FileVideo className="h-5 w-5 flex-shrink-0 text-primary" />
                          <span className="truncate">{task.filename || "Unnamed video"}</span>
                        </CardTitle>
                        <p className="mt-1 break-all text-xs text-muted-foreground">{task.task_id}</p>
                      </div>
                      <Badge variant="outline" className={cn("capitalize", STATUS_CLASS[task.status])}>
                        {STATUS_LABEL[task.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="font-medium text-foreground">{formatDate(task.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Updated</div>
                        <div className="font-medium text-foreground">{formatDate(task.updated_at)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Step</div>
                        <div className="font-medium text-foreground">
                          {task.current_step} / {task.total_steps}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Progress</div>
                        <div className="font-medium text-foreground">{progressValue}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={progressValue} />
                      <p className="text-sm text-muted-foreground">
                        {task.status === "failed" ? task.error || task.message : task.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      {canRefreshStatus && (
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() => void handleOpenTask(task.task_id)}
                          disabled={isTaskLoading}
                        >
                          {isTaskLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          View Status
                        </Button>
                      )}

                      {canOpenResult && (
                        <Button
                          className="gap-2"
                          onClick={() => void handleOpenTask(task.task_id)}
                          disabled={isTaskLoading}
                        >
                          {isTaskLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          View Result
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
