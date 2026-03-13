export interface Segment {
  start: number;
  end: number;
  text: string;
}

export interface UploadResponse {
  task_id: string;
  text: string;
  segments: Segment[];
  summary_keywords: string;
}