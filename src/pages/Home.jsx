import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function Home() {
  const imageInputRef = useRef(null);
  const addImageRef = useRef(null);
  const txtInputRef = useRef(null);

  /* ================= STATES ================= */
  const [halfInput, setHalfInput] = useState("");
  const [fullInput, setFullInput] = useState("");

  const [halfResult, setHalfResult] = useState([]);
  const [fullResult, setFullResult] = useState([]);
  const [mergedResult, setMergedResult] = useState([]);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageResult, setImageResult] = useState([]);
  const [imageTotal, setImageTotal] = useState(0);

  const [txtRaw, setTxtRaw] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  /* ================= NORMALIZE ================= */
  const normalizeToken = (token) => {
    if (!token) return [];

    token = token.replace(/\.{1,3}/g, "-");
    if (!/^\d{2,3}/.test(token)) return [];

    const parts = token.split("-");
    let base = parts[0];
    if (base.length === 2) base = "0" + base;

    const out = [];

    if (parts.length === 1) {
      out.push(base);
      return out;
    }

    const count = Math.min(parseInt(parts[1] || "1", 10), 10);
    out.push(`${base}-${count}`);
    return out;
  };

  /* ================= TEXT GENERATOR ================= */
  const processInput = (input) => {
    if (!input.trim()) return [];
    const freq = {};

    input.split(/[\s,]+/).forEach((raw) => {
      normalizeToken(raw.trim()).forEach((val) => {
        const [n, c] = val.split("-");
        const cnt = c ? Number(c) : 1;
        freq[n] = (freq[n] || 0) + cnt;
      });
    });

    return Object.entries(freq).map(([n, c]) =>
      c > 1 ? `${n}-${c}` : n
    );
  };

  const generateText = () => {
    const h = processInput(halfInput);
    const f = processInput(fullInput);

    setHalfResult(h);
    setFullResult(f);
    setMergedResult(processInput(`${halfInput} ${fullInput}`));
  };

  /* ================= IMAGE GENERATOR ================= */
  const handleInitialImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((p) => [...p, ...files]);
    setImagePreviews((p) => [
      ...p,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const deleteImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const generateImage = async () => {
    if (!images.length) return alert("Upload images first");

    setImageLoading(true);
    setImageResult([]);
    setImageTotal(0);

    const freq = {};
    let total = 0;

    for (const img of images) {
      const { data: { text } } = await Tesseract.recognize(img, "eng");
      const nums = text.match(/\d{3}/g);

      nums?.forEach((n) => {
        freq[n] = (freq[n] || 0) + 1;
        total++;
      });
    }

    setImageTotal(total);
    setImageResult(
      Object.entries(freq).map(([n, c]) =>
        c > 1 ? `${n}-${c}` : n
      )
    );

    setImageLoading(false);
  };

  /* ================= TEXT FILE CLEAN ================= */
  const getTxtCleanData = () => {
    if (!txtRaw) return [];

    const keywords = ["full", "half", "off", "bc", "ac", "ab", "box"];
    const result = [];

    txtRaw.split("\n").forEach((line) => {
      let cleaned = line
        .replace(/\[\d{1,2}\/\d{1,2}\/\d{2,4},?\s*\d{1,2}:\d{2}.*?\]/g, "")
        .replace(/^.*?:/, "")
        .replace(/messages and calls.*encrypted/gi, "")
        .replace(/image omitted|video omitted/gi, "")
        .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
        .replace(/\.{1,3}/g, "-")
        .replace(/[^a-zA-Z0-9-,\s]/g, " ")
        .trim();

      if (!cleaned) return;

      cleaned.split(/[\s,]+/).forEach((token) => {
        const t = token.toLowerCase();

        if (keywords.includes(t)) {
          result.push(t.toUpperCase());
          return;
        }

        if (/^\d{2,3}(-\d{1,2})?$/.test(token)) {
          normalizeToken(token).forEach((v) => result.push(v));
        }
      });
    });

    return result;
  };

  /* ================= TXT EXPORT ================= */
  const exportTxtPDF = () => {
    if (!txtRaw) return alert("Upload txt file first");

    const doc = new jsPDF();
    autoTable(doc, {
      head: [["VALUE"]],
      body: getTxtCleanData().map((v) => [v]),
    });
    doc.save("text-file.pdf");
  };

  const exportTxtExcel = () => {
    if (!txtRaw) return alert("Upload txt file first");

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(getTxtCleanData().map((v) => ({ Value: v }))),
      "Text File"
    );

    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]),
      "text-file.xlsx"
    );
  };

  /* ================= COMBINED EXPORT ================= */
  const exportCombinedPDF = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.text("Text Generator", 14, y);
    y += 6;

    const maxLen = Math.max(
      halfResult.length,
      fullResult.length,
      mergedResult.length
    );

    autoTable(doc, {
      startY: y,
      head: [["Half", "Full", "Merged"]],
      body: Array.from({ length: maxLen }, (_, i) => [
        halfResult[i] || "",
        fullResult[i] || "",
        mergedResult[i] || "",
      ]),
    });

    y = doc.lastAutoTable.finalY + 12;

    doc.text("Image Generator", 14, y);
    y += 6;
    doc.text(`Total Numbers: ${imageTotal}`, 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Value"]],
      body: imageResult.map((v) => [v]),
    });

    doc.save("number-generator-report.pdf");
  };

  /* ================= RESET ================= */
  const resetAll = () => {
    setHalfInput("");
    setFullInput("");
    setHalfResult([]);
    setFullResult([]);
    setMergedResult([]);
    setImages([]);
    setImagePreviews([]);
    setImageResult([]);
    setImageTotal(0);
    setTxtRaw(null);

    imageInputRef.current.value = "";
    addImageRef.current.value = "";
    txtInputRef.current.value = "";
  };

  /* ================= UI ================= */
  return (
    <div className="flex justify-center min-h-screen pt-10">
      <div className="w-full max-w-xl p-6 bg-white rounded shadow">

        <h2 className="mb-4 text-lg font-semibold text-center">
          Number Generator
        </h2>

        {/* TEXT GENERATOR */}
        <h3 className="font-semibold">Text Generator</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <textarea
            className="p-2 border rounded"
            placeholder="Half"
            value={halfInput}
            onChange={(e) => setHalfInput(e.target.value)}
          />
          <textarea
            className="p-2 border rounded"
            placeholder="Full"
            value={fullInput}
            onChange={(e) => setFullInput(e.target.value)}
          />
        </div>

        <button
          onClick={generateText}
          className="w-full py-2 mt-2 text-white bg-green-600 rounded"
        >
          Generate Text
        </button>

        {/*  RESULT DISPLAY FIX */}
        {(halfResult.length > 0 || fullResult.length > 0) && (
          <div className="p-3 mt-3 text-sm bg-gray-100 rounded">
            <p><b>Half:</b> {halfResult.join(", ") || "-"}</p>
            <p><b>Full:</b> {fullResult.join(", ") || "-"}</p>
            <p><b>Merged:</b> {mergedResult.join(", ") || "-"}</p>
          </div>
        )}

        {/* TEXT FILE GENERATOR */}
        <h3 className="mt-4 font-semibold">Text File Generator</h3>
        <input
          ref={txtInputRef}
          type="file"
          accept=".txt"
          onChange={(e) => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setTxtRaw(r.result);
            r.readAsText(f);
          }}
        />

        <div className="flex gap-2 mt-2">
          <button
            onClick={exportTxtPDF}
            className="flex-1 py-2 text-white bg-red-500 rounded"
          >
            Export TXT PDF
          </button>
          <button
            onClick={exportTxtExcel}
            className="flex-1 py-2 text-white bg-green-600 rounded"
          >
            Export TXT Excel
          </button>
        </div>

        {/* IMAGE GENERATOR */}
        <h3 className="mt-4 font-semibold">Image Generator</h3>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInitialImageUpload}
        />

        <input
          ref={addImageRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAddImages}
          className="hidden"
        />

        {imagePreviews.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="object-cover h-20 border rounded" />
                  <button
                    onClick={() => deleteImage(i)}
                    className="absolute top-0 right-0 px-1 text-xs text-white bg-red-600 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addImageRef.current.click()}
              className="w-full py-2 mt-2 text-white bg-blue-500 rounded"
            >
              ➕ Add Images
            </button>
          </>
        )}

        <button
          onClick={generateImage}
          disabled={imageLoading}
          className="w-full py-2 mt-2 text-white bg-purple-600 rounded"
        >
          {imageLoading ? "Processing..." : "Generate Image"}
        </button>

        {imageResult.length > 0 && (
          <div className="mt-3">
            <p><b>Total Numbers:</b> {imageTotal}</p>
            <p>{imageResult.join(", ")}</p>
          </div>
        )}

        <button
          onClick={exportCombinedPDF}
          className="w-full py-2 mt-4 text-white bg-red-600 rounded"
        >
          Export PDF
        </button>

        <button
          onClick={resetAll}
          className="w-full py-2 mt-3 text-white bg-gray-500 rounded"
        >
          Reset
        </button>

      </div>
    </div>
  );
}
