import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import {
  Mic,
  Users,
  Heart,
  Image,
  Play,
  ArrowRight,
  Sparkles
} from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Speech Recognition & Subtitles",
    description: "Automatically transcribe video audio into accurate text subtitles with timestamps"
  },
  {
    icon: Users,
    title: "Speaker Identification",
    description: "Identify and distinguish different speakers throughout your video content"
  },
  {
    icon: Heart,
    title: "Emotion Analysis",
    description: "Detect and analyze emotional tones in speech to understand sentiment patterns"
  },
  {
    icon: Image,
    title: "Keyframe Extraction",
    description: "Automatically extract important visual frames for quick content navigation"
  }
]

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

        {/* Features Section */}
        {/* <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Powerful Analysis Features
              </h2>
              <p className="text-muted-foreground">
                Comprehensive tools for understanding every aspect of your video content
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* Dashboard Preview Section */}
        {/* <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">
                Intuitive Analysis Dashboard
              </h2>
              <p className="text-muted-foreground">
                Navigate, search, and explore your video content with ease
              </p>
            </div>

            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-chart-3/60" />
                <div className="h-3 w-3 rounded-full bg-chart-2/60" />
                <span className="ml-4 text-sm text-muted-foreground">Video Analysis Dashboard</span>
              </div>
              <div className="p-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">Video Player</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-medium">Video Summary</h4>
                      <p className="text-xs text-muted-foreground">AI-generated summary of your video content...</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-medium">Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {["AI", "Technology", "Interview"].map((tag) => (
                          <span key={tag} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <h4 className="mb-2 text-sm font-medium">Emotions</h4>
                      <div className="h-20 rounded bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Emotion Chart</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  )
}
