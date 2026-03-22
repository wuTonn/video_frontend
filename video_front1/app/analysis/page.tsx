"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { VideoPlayer } from "@/components/video-player"
import { AnalysisCards } from "@/components/analysis-cards"
import { SearchModule } from "@/components/search-module"
import { TranscriptPanel } from "@/components/transcript-panel"
import { KeyframePanel } from "@/components/keyframe-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"

// Mock data
const mockSummary = "This video discusses the transformative impact of artificial intelligence on modern industries. The speakers explore various applications of AI in healthcare, education, and technology sectors, highlighting both opportunities and challenges. Key themes include machine learning advancements, ethical considerations, and future predictions for AI development."

const mockKeywords = ["AI", "Technology", "Machine Learning", "Healthcare", "Education", "Innovation", "Future", "Ethics"]

const mockEmotions = [
  { name: "Happy", value: 35, color: "oklch(0.7 0.15 160)" },
  { name: "Neutral", value: 45, color: "oklch(0.65 0.05 250)" },
  { name: "Sad", value: 10, color: "oklch(0.55 0.22 255)" },
  { name: "Surprised", value: 10, color: "oklch(0.75 0.18 80)" },
]

const mockSpeakers = [
  { name: "Speaker A", percentage: 55 },
  { name: "Speaker B", percentage: 35 },
  { name: "Speaker C", percentage: 10 },
]

const mockTranscripts = [
  { id: 1, timestamp: 0, speaker: "Speaker A", emotion: "happy", text: "Welcome everyone to today's presentation on artificial intelligence." },
  { id: 2, timestamp: 15, speaker: "Speaker B", emotion: "neutral", text: "Today we will discuss how AI is transforming various industries around the world." },
  { id: 3, timestamp: 35, speaker: "Speaker A", emotion: "happy", text: "Let's start with healthcare. AI is revolutionizing medical diagnosis and treatment." },
  { id: 4, timestamp: 55, speaker: "Speaker B", emotion: "neutral", text: "Machine learning algorithms can now detect diseases earlier than traditional methods." },
  { id: 5, timestamp: 75, speaker: "Speaker C", emotion: "surprised", text: "The accuracy rates are truly remarkable, often exceeding human capabilities." },
  { id: 6, timestamp: 95, speaker: "Speaker A", emotion: "neutral", text: "Moving on to education, AI is personalizing learning experiences for students." },
  { id: 7, timestamp: 115, speaker: "Speaker B", emotion: "happy", text: "Adaptive learning platforms are making education more accessible worldwide." },
  { id: 8, timestamp: 135, speaker: "Speaker A", emotion: "neutral", text: "However, we must also consider the ethical implications of AI development." },
  { id: 9, timestamp: 155, speaker: "Speaker C", emotion: "sad", text: "There are concerns about job displacement and privacy issues." },
  { id: 10, timestamp: 175, speaker: "Speaker B", emotion: "neutral", text: "It's important to develop AI responsibly and with proper governance." },
  { id: 11, timestamp: 195, speaker: "Speaker A", emotion: "happy", text: "Looking ahead, the future of AI is incredibly promising." },
  { id: 12, timestamp: 215, speaker: "Speaker B", emotion: "happy", text: "We expect to see major breakthroughs in natural language processing and robotics." },
  { id: 13, timestamp: 235, speaker: "Speaker C", emotion: "neutral", text: "The key is to balance innovation with responsibility." },
  { id: 14, timestamp: 255, speaker: "Speaker A", emotion: "happy", text: "Thank you all for joining us today. Let's embrace the AI revolution together." },
]

const mockKeyframes = [
  { id: 1, timestamp: 10, thumbnail: "/keyframe-1.jpg" },
  { id: 2, timestamp: 45, thumbnail: "/keyframe-2.jpg" },
  { id: 3, timestamp: 92, thumbnail: "/keyframe-3.jpg" },
  { id: 4, timestamp: 130, thumbnail: "/keyframe-4.jpg" },
  { id: 5, timestamp: 168, thumbnail: "/keyframe-5.jpg" },
  { id: 6, timestamp: 210, thumbnail: "/keyframe-6.jpg" },
  { id: 7, timestamp: 245, thumbnail: "/keyframe-7.jpg" },
  { id: 8, timestamp: 280, thumbnail: "/keyframe-8.jpg" },
]

export default function AnalysisPage() {
  const [currentTime, setCurrentTime] = useState(0)

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Video Player Section */}
        <div className="mb-6">
          <VideoPlayer currentTime={currentTime} onTimeUpdate={handleTimeUpdate} />
        </div>

        {/* Analysis Cards */}
        <div className="mb-6">
          <AnalysisCards
            summary={mockSummary}
            keywords={mockKeywords}
            emotions={mockEmotions}
            speakers={mockSpeakers}
          />
        </div>

        {/* Search Module */}
        <div className="mb-6">
          <SearchModule transcripts={mockTranscripts} onSeek={handleSeek} />
        </div>

        {/* Transcript and Keyframes */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <TranscriptPanel
            transcripts={mockTranscripts}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
          <KeyframePanel
            keyframes={mockKeyframes}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>

        {/* Report Module */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Generate Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link href="/report">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Preview Report
                </Button>
              </Link>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Generate PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
