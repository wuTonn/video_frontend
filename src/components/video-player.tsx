import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  currentTime: number
  onTimeUpdate: (time: number) => void
  src?: string | null
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export function VideoPlayer({
  currentTime,
  onTimeUpdate,
  src,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [internalTime, setInternalTime] = useState(0)

  const videoSrc = src && src.length > 0 ? src : ""
  const hasVideo = videoSrc.length > 0

  useEffect(() => {
    setInternalTime(0)
    setDuration(0)
    setIsPlaying(false)
    const el = videoRef.current
    if (el) {
      el.pause()
      el.currentTime = 0
      el.load()
    }
  }, [videoSrc])

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setInternalTime(time)
      onTimeUpdate(time)
    }
  }, [onTimeUpdate])

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const d = videoRef.current.duration
      setDuration(Number.isFinite(d) && d > 0 ? d : 0)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current || !hasVideo) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [hasVideo, isPlaying])

  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0]
    if (videoRef.current && hasVideo) {
      videoRef.current.currentTime = newTime
    }
    setInternalTime(newTime)
    onTimeUpdate(newTime)
  }, [hasVideo, onTimeUpdate])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const handleFullscreen = useCallback(() => {
    if (!videoRef.current || !hasVideo) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }, [hasVideo])

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        {hasVideo ? (
          <video
            key={videoSrc}
            ref={videoRef}
            className="h-full w-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoSrc} />
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground">
                <Play className="ml-1 h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                Video preview is unavailable after page reload.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-muted-foreground">
            {formatTime(internalTime)}
          </span>
          <Slider
            value={[internalTime]}
            max={duration || 1}
            step={1}
            onValueChange={handleSeek}
            disabled={!hasVideo}
            className="flex-1"
          />
          <span className="w-12 text-right text-xs font-medium text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={!hasVideo}
              className="h-9 w-9"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                disabled={!hasVideo}
                className="h-9 w-9"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                disabled={!hasVideo}
                className="w-24"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFullscreen}
            disabled={!hasVideo}
            className="h-9 w-9"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
