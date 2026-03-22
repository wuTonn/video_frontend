"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Download,
  ArrowLeft,
  FileVideo,
  FileText,
  Tag,
  Image,
  Heart,
  Users,
  MessageSquare,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

// Mock data
const videoInfo = {
  filename: "ai_presentation_2024.mp4",
  duration: "4:35",
  uploadTime: "2024-03-15 14:30:00",
}

const summary = "This video discusses the transformative impact of artificial intelligence on modern industries. The speakers explore various applications of AI in healthcare, education, and technology sectors, highlighting both opportunities and challenges. Key themes include machine learning advancements, ethical considerations, and future predictions for AI development. The presentation emphasizes the importance of responsible AI development while embracing innovation."

const keywords = ["AI", "Technology", "Machine Learning", "Healthcare", "Education", "Innovation", "Future", "Ethics", "Automation", "Data Science"]

const emotions = [
  { name: "Happy", value: 35, color: "oklch(0.7 0.15 160)" },
  { name: "Neutral", value: 45, color: "oklch(0.65 0.05 250)" },
  { name: "Sad", value: 10, color: "oklch(0.55 0.22 255)" },
  { name: "Surprised", value: 10, color: "oklch(0.75 0.18 80)" },
]

const speakers = [
  { name: "Speaker A", percentage: 55 },
  { name: "Speaker B", percentage: 35 },
  { name: "Speaker C", percentage: 10 },
]

const keyTranscripts = [
  { timestamp: "00:00:35", speaker: "Speaker A", text: "Let's start with healthcare. AI is revolutionizing medical diagnosis and treatment." },
  { timestamp: "00:01:35", speaker: "Speaker A", text: "However, we must also consider the ethical implications of AI development." },
  { timestamp: "00:03:15", speaker: "Speaker A", text: "Looking ahead, the future of AI is incredibly promising." },
  { timestamp: "00:04:15", speaker: "Speaker A", text: "Thank you all for joining us today. Let's embrace the AI revolution together." },
]

const keyframes = [
  { id: 1, timestamp: "00:00:10" },
  { id: 2, timestamp: "00:01:32" },
  { id: 3, timestamp: "00:02:48" },
  { id: 4, timestamp: "00:03:30" },
]

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/analysis">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analysis Report</h1>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Video Information */}
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
                  <p className="font-medium">{videoInfo.filename}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{videoInfo.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upload Time</p>
                  <p className="font-medium">{videoInfo.uploadTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Summary */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Video Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{summary}</p>
            </CardContent>
          </Card>

          {/* Keywords */}
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
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyframe Highlights */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-5 w-5 text-primary" />
                Keyframe Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {keyframes.map((frame) => (
                  <div key={frame.id} className="overflow-hidden rounded-lg border border-border">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-1 h-8 w-8 rounded bg-muted-foreground/20 flex items-center justify-center">
                          <Image className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">Frame {frame.id}</span>
                      </div>
                    </div>
                    <div className="bg-card p-2 text-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        {frame.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Emotion Analysis */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Emotion Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div className="h-48 w-48 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={emotions}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {emotions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                                  <p className="font-medium">{payload[0].name}</p>
                                  <p className="text-muted-foreground">{payload[0].value}%</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3">
                    {emotions.map((emotion) => (
                      <div key={emotion.name} className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: emotion.color }}
                        />
                        <span className="text-sm text-foreground">{emotion.name}</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {emotion.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Speaker Analysis */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Speaker Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={speakers} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 14 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                                <p className="font-medium">{payload[0].payload.name}</p>
                                <p className="text-muted-foreground">{payload[0].value}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar
                        dataKey="percentage"
                        fill="oklch(0.55 0.22 255)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Important Transcript Segments */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Important Transcript Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyTranscripts.map((transcript, index) => (
                  <div key={index}>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {transcript.timestamp}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {transcript.speaker}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        &quot;{transcript.text}&quot;
                      </p>
                    </div>
                    {index < keyTranscripts.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
