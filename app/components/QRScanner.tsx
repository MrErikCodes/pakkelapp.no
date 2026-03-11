"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import jsQR from "jsqr";

interface QRScannerProps {
  onScan: (data: string) => void;
}

function decodeQRFromImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Kunne ikke opprette canvas"));
        return;
      }

      // Try multiple scales for dense QR codes
      const scales = [1, 0.5, 2, 0.75, 1.5];
      for (const scale of scales) {
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resolve(code.data);
          return;
        }
      }
      reject(new Error("Fant ingen QR-kode i bildet. Prøv å lime inn teksten direkte."));
    };
    img.onerror = () => reject(new Error("Kunne ikke laste bildet"));
    img.src = URL.createObjectURL(file);
  });
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const [mode, setMode] = useState<"upload" | "camera" | "text">("upload");
  const [textInput, setTextInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setScanning(true);

    try {
      const result = await decodeQRFromImage(file);
      onScan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ukjent feil");
    } finally {
      setScanning(false);
    }
  };

  const startCamera = async () => {
    setError("");
    setScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scan = () => {
        if (!video.videoWidth) {
          animFrameRef.current = requestAnimationFrame(scan);
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          stopCamera();
          onScan(code.data);
        } else {
          animFrameRef.current = requestAnimationFrame(scan);
        }
      };
      animFrameRef.current = requestAnimationFrame(scan);
    } catch (err) {
      setError(
        `Kunne ikke starte kamera. ${err instanceof Error ? err.message : ""}`,
      );
      setScanning(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setError("");
      onScan(textInput.trim());
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        {(
          [
            { key: "upload", label: "Last opp bilde" },
            { key: "camera", label: "Kamera" },
            { key: "text", label: "Lim inn tekst" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (mode === "camera" && tab.key !== "camera") stopCamera();
              setMode(tab.key);
              setError("");
            }}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === tab.key
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl cursor-pointer hover:border-red-400 dark:hover:border-red-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium">
              {scanning
                ? "Leser QR-kode..."
                : "Klikk for \u00E5 laste opp screenshot"}
            </span>
            <span className="text-xs">
              PNG, JPG eller skjermbilde fra Posten-appen
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={scanning}
          />
        </label>
      )}

      {/* Camera mode */}
      {mode === "camera" && (
        <div className="space-y-3">
          <div className="w-full rounded-xl overflow-hidden bg-black aspect-[4/3]">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
          </div>
          {!scanning ? (
            <button
              onClick={startCamera}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Start kamera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="w-full py-3 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              Stopp kamera
            </button>
          )}
        </div>
      )}

      {/* Text paste mode */}
      {mode === "text" && (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Lim inn QR-kode tekst her (Label=1|ConsignorName=...)"
            className="w-full h-40 p-3 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-800 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-400 text-white rounded-lg font-medium transition-colors"
          >
            Generer pakkelapp
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
