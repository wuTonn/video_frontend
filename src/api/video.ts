import axios from "axios";
import type { UploadResponse } from "../types/video";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<UploadResponse>(
    "/video/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};