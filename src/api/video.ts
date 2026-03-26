import axios from "axios";
import type { UploadResponse } from "../types/video";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  // FIX 4: 不手动设置 Content-Type，让浏览器自动附加正确的 boundary
  const response = await api.post<UploadResponse>("/video/upload", formData);

  return response.data;
};
