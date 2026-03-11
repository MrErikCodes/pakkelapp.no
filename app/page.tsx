"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { parseQRData } from "./lib/parseQR";
import { generateLabelPDF, downloadLabelPDF, getLabelBlobURL } from "./lib/generateLabel";
import { LabelData } from "./lib/types";

const QRScanner = dynamic(() => import("./components/QRScanner"), {
  ssr: false,
});

function loadImageAsDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no ctx"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function Home() {
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [rawText, setRawText] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const logoRef = useRef<string | null>(null);

  // Pre-load the Posten logo
  useEffect(() => {
    loadImageAsDataURL("/posten.png")
      .then((url) => { logoRef.current = url; })
      .catch(() => {});
  }, []);

  // Generate PDF preview when label data changes
  useEffect(() => {
    if (labelData) {
      const url = getLabelBlobURL(labelData, logoRef.current);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [labelData]);

  const handleScan = useCallback((data: string) => {
    setRawText(data);
    const parsed = parseQRData(data);
    setLabelData(parsed);
  }, []);

  const handleDownloadPDF = () => {
    if (labelData) {
      downloadLabelPDF(labelData, logoRef.current);
    }
  };

  const handleReset = () => {
    setLabelData(null);
    setRawText("");
    setPdfUrl(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
              <span className="text-[#E32D22]">Pakkelapp</span>.no
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Skann QR-kode fra Posten/Bring-appen og generer adresselapp
            </p>
          </div>
          {labelData && (
            <button
              onClick={handleReset}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Ny skanning
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!labelData ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                Skann QR-koden fra Posten-appen
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm max-w-md mx-auto">
                Last opp et skjermbilde av QR-koden, bruk kameraet, eller lim
                inn QR-teksten direkte.
              </p>
            </div>
            <QRScanner onScan={handleScan} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action buttons */}
            <div className="flex gap-3 justify-center print:hidden">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-[#E32D22] hover:bg-[#c9261d] text-white rounded-lg font-medium transition-colors shadow-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Last ned PDF
              </button>
              <button
                onClick={() => {
                  if (labelData) {
                    const doc = generateLabelPDF(labelData, logoRef.current);
                    doc.autoPrint();
                    const blob = doc.output("blob");
                    const url = URL.createObjectURL(blob);
                    window.open(url);
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Skriv ut
              </button>
            </div>

            {/* PDF preview */}
            {pdfUrl && (
              <div className="flex justify-center print:m-0">
                <iframe
                  src={pdfUrl}
                  className="w-full max-w-lg border border-zinc-300 dark:border-zinc-700 rounded-lg"
                  style={{ height: "80vh", minHeight: "600px" }}
                  title="Label preview"
                />
              </div>
            )}

            {/* Raw data (collapsible) */}
            <details className="max-w-xl mx-auto print:hidden">
              <summary className="text-sm text-zinc-500 dark:text-zinc-400 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-300 text-center">
                Vis r&aring;data fra QR-kode
              </summary>
              <pre className="mt-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all text-zinc-700 dark:text-zinc-300">
                {rawText}
              </pre>
            </details>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-zinc-400 space-y-1">
          <p>Alt skjer lokalt i nettleseren. Ingen data sendes til noen server.</p>
          <p>
            Laget av Nilsen Konsult (931405861MVA) &mdash;{" "}
            <a href="mailto:erik@nilsenkonsult.no" className="underline hover:text-zinc-300">
              erik@nilsenkonsult.no
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
