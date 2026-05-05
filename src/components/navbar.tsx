import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { History, Video, Upload } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Video className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Multimodal AI Video Analyzer</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/history">
            <Button variant="ghost" className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
          <Link to="/upload">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Video
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
