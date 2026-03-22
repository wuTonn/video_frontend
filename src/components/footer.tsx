import { Video } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Video className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Multimodal AI Video Analyzer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Powered by AI. Built for video understanding.
          </p>
        </div>
      </div>
    </footer>
  )
}
