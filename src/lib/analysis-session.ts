import type { AnalysisSessionData } from "@/types/video"

export const ANALYSIS_SESSION_KEY = "mv-video-analysis-v1"

export function saveAnalysisSession(data: AnalysisSessionData): void {
  try {
    sessionStorage.setItem(ANALYSIS_SESSION_KEY, JSON.stringify(data))
  } catch {
    // 存储失败时仍可通过路由 state 进入分析页
  }
}

export function loadAnalysisSession(): AnalysisSessionData | null {
  try {
    const raw = sessionStorage.getItem(ANALYSIS_SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AnalysisSessionData
  } catch {
    return null
  }
}
