import { useState } from "react";
import { uploadVideo } from "../api/video";
import type { UploadResponse } from "../types/video";

export default function UploadPanel() {
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await uploadVideo(file);
      setResult(data);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <input type="file" accept="video/*" onChange={handleUpload} />

      {loading && <p>Uploading...</p>}

      {result && (
        <>
          <h3>Summary & Keywords</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {result.summary_keywords}
          </div>

          <h3>Transcript</h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {result.segments.map((seg, index) => (
              <p key={index}>
                [{seg.start.toFixed(2)} - {seg.end.toFixed(2)}] {seg.text}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}