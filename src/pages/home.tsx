import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {

  Play,
  ArrowRight,
  Sparkles
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Powered Video Intelligence
              </div>

              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                AI-powered Video Content Analysis
              </h1>

              <p className="mb-10 text-pretty text-lg text-muted-foreground sm:text-xl">
                Extract subtitles, identify speakers, analyze emotions, capture keyframes,
                and generate comprehensive summaries from your videos automatically.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/upload">
                  <Button size="lg" className="gap-2 px-8">
                    <Play className="h-5 w-5" />
                    Upload a Video
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="outline" size="lg" className="gap-2 px-8">
                    View Demo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
