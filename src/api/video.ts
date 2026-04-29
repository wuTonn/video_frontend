import axios from "axios";
import type { TaskStatusResponse } from "../types/video";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadVideo = async (file: File): Promise<TaskStatusResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<TaskStatusResponse>("/video/upload", formData);
  return response.data;
};

export const getVideoTask = async (taskId: string): Promise<TaskStatusResponse> => {
  const response = await api.get<TaskStatusResponse>(`/video/task/${taskId}`);
  return response.data;
};
