import axios from "axios";
import type { ReportPayload, TaskStatusResponse } from "../types/video";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.PROD ? "" : "http://127.0.0.1:8000");

const api = axios.create({
  baseURL: API_BASE_URL,
});

export function buildMediaUrl(path: string): string {
  const value = path.trim()
  if (!value) return ""
  if (/^(https?:|data:|blob:)/i.test(value)) return value

  const baseUrl = API_BASE_URL.replace(/\/$/, "")
  const mediaPath = value.startsWith("/") ? value : `/${value}`
  return `${baseUrl}${mediaPath}`
}

export function buildUploadedVideoUrl(taskId: string, filename: string): string {
  const mediaFilename = encodeURIComponent(`${taskId}_${filename}`)
  return buildMediaUrl(`/media/uploads/${mediaFilename}`)
}

function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === "string" && detail.trim()) return new Error(detail)
    if (error.message) return new Error(error.message)
  }
  if (error instanceof Error) return error
  return new Error(fallback)
}

export const uploadVideo = async (file: File): Promise<TaskStatusResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post<TaskStatusResponse>("/video/upload", formData);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Upload failed.");
  }
};

export const getVideoTask = async (taskId: string): Promise<TaskStatusResponse> => {
  try {
    const response = await api.get<TaskStatusResponse>(`/video/task/${taskId}`);
    return response.data;
  } catch (error) {
    throw toApiError(error, "Unable to load task status.");
  }
};

export const downloadReportPdf = async (payload: ReportPayload): Promise<Blob> => {
  try {
    const response = await api.post("/video/report/pdf", payload, {
      responseType: "blob",
    });
    return response.data as Blob;
  } catch (error) {
    throw toApiError(error, "PDF report generation failed.");
  }
};
