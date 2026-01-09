import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Capacitor } from "@capacitor/core";

const isAndroid = () => Capacitor.getPlatform() === "android";

export default function Home() {
  const imageInputRef = useRef(null);

  /* ================= STATES ================= */
  const [halfInput, setHalfInput] = useState("");
  const [fullInput, setFullInput] = useState("");
  const [halfResult, setHalfResult] = useState([]);
  const [fullResult, setFullResult] = useState([]);
  const [mergedResult, setMergedResult] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageResult, setImageResult] = useState([]);
  const [txtRaw, setTxtRaw] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [exportSource, setExportSource] = useState(""); 

  /* ================= UTILS FOR KEYWORDS & NUMBERS ================= */
  const normalizeToken = (token) => {
    if (!token) return [];
    
    // Clean the token and make it Uppercase for consistency
    let clean = token.replace(/\.{1,3}/g, "-").toUpperCase().trim();
    
    // List of specific keywords to allow
    const keywords = ["AC", "BC", "AB", "HALF OFF", "FULL", "BOX", "OC", "OFF", "HALF"];
    
    // Check if the token matches or starts with a keyword (e.g., "AC-13" or just "BOX")
    const kwMatch = keywords.find(kw => clean.startsWith(kw));
    if (kwMatch) {
        return [{ base: clean, count: 1 }];
    }

    // Process numerical patterns
    if (!/^\d{1,3}/.test(clean)) return [];
    const parts = clean.split("-");
    let base = parts[0];
    
    // Auto-pad numbers to 3 digits (e.g., "7" becomes "007")
    if (base.length === 1) base = "00" + base;
    else if (base.length === 2) base = "0" + base; 
    
    const count = parts.length > 1 ? Math.min(parseInt(parts[1] || "1", 10), 500) : 1;
    return [{ base, count }];
  };

  const processInput = (input) => {
    if (!input || !input.trim()) return [];
    const freq = {};
    input.split(/[\s,]+/).forEach((raw) => {
      normalizeToken(raw.trim()).forEach(({ base, count }) => {
        freq[base] = (freq[base] || 0) + count;
      });
    });
    return Object.entries(freq).map(([n, c]) => (c > 1 ? `${n}-${c}` : n));
  };

  const getTxtCleanData = () => {
    if (!txtRaw) return [];
    const freq = {};
    
    // Regex that captures digits AND specified keywords
    const regex = /\d{1,3}([\.-]\d{1,5})?|AC(-\d+)?|BC(-\d+)?|AB(-\d+)?|HALF OFF|FULL(-\d+)?|BOX|OC|OFF(-\d+)?|HALF/gi;
    const matches = txtRaw.match(regex) || [];
    
    matches.forEach((token) => {
      normalizeToken(token).forEach(({ base, count }) => {
        freq[base] = (freq[base] || 0) + count;
      });
    });
    return Object.entries(freq).map(([n, c]) => (c > 1 ? `${n}-${c}` : n));
  };

  /* ================= OCR SCANNING LOGIC ================= */
  const runVisualScan = async () => {
    if (images.length === 0) return alert("Select images.");
    setImageLoading(true);
    setScanProgress(0);

    try {
      const freq = {};
      for (let i = 0; i < images.length; i++) {
        const worker = await Tesseract.createWorker('eng', 1, {
          logger: m => m.status === 'recognizing text' && setScanProgress(Math.floor(m.progress * 100))
        });
        const { data: { text } } = await worker.recognize(images[i]);
        
        // Use keyword-aware regex for image scanning too
        const regex = /\d{1,3}([\.-]\d{1,5})?|AC(-\d+)?|BC(-\d+)?|AB(-\d+)?|HALF OFF|FULL(-\d+)?|BOX|OC|OFF(-\d+)?|HALF/gi;
        const found = text.match(regex) || [];
        
        found.forEach(raw => {
          normalizeToken(raw).forEach(({ base, count }) => {
            freq[base] = (freq[base] || 0) + count;
          });
        });
        await worker.terminate();
      }
      setImageResult(Object.entries(freq).map(([n, c]) => (c > 1 ? `${n}-${c}` : n)));
      alert("Scan Complete ✅");
    } catch (err) {
      alert("OCR Error. Ensure internet is active for first run.");
    } finally {
      setImageLoading(false);
      setScanProgress(0);
    }
  };

  /* ================= EXPORT & STORAGE ================= */
  const saveToDevice = async (base64Data, fileName) => {
    try {
      const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        encoding: Encoding.BASE64
      });
      alert(`Saved: ${fileName} ✅`);
    } catch (err) { alert("Storage failed."); }
  };

  const handleExport = async (format) => {
    const doc = new jsPDF();
    let fileName = `${exportSource}_report_${Date.now()}`;
    const data = exportSource === "manual" ? mergedResult : exportSource === "file" ? getTxtCleanData() : imageResult;

    if (format === "pdf") {
      autoTable(doc, { head: [["Result"]], body: data.map(v => [v]) });
      isAndroid() ? await saveToDevice(doc.output("datauristring").split(",")[1], `${fileName}.pdf`) : doc.save(`${fileName}.pdf`);
    } else {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.map(v => ({ Value: v }))), "Data");
      isAndroid() ? await saveToDevice(XLSX.write(wb, { type: "base64" }), `${fileName}.xlsx`) : saveAs(new Blob([XLSX.write(wb, { type: "array" })]), `${fileName}.xlsx`);
    }
    setShowDownloadModal(false);
  };

  return (
    <div className="relative min-h-screen font-sans bg-white text-slate-900">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-100 rounded-full blur-[100px] opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="max-w-xl p-4 pt-12 pb-24 mx-auto space-y-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-950 drop-shadow-sm">Generator Pro</h1>
          <p className="text-[10px] text-indigo-600 font-bold tracking-[0.5em] uppercase mt-2">Professional Data System</p>
        </header>

        {/* 01. MANUAL PROCESSOR */}
        <div className="bg-white/80 backdrop-blur-3xl p-7 rounded-[2.5rem] shadow-2xl border border-white">
          <h2 className="mb-5 text-[10px] font-black tracking-widest text-indigo-700 uppercase">01. Manual Processor</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <textarea className="h-32 p-4 text-sm font-medium border outline-none bg-white/40 border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900" placeholder="Half" value={halfInput} onInput={(e) => setHalfInput(e.target.value)} />
            <textarea className="h-32 p-4 text-sm font-medium border outline-none bg-white/40 border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-900" placeholder="Full" value={fullInput} onInput={(e) => setFullInput(e.target.value)} />
          </div>
          <button onClick={() => { setHalfResult(processInput(halfInput)); setFullResult(processInput(fullInput)); setMergedResult(processInput(`${halfInput} ${fullInput}`)); }} className="w-full py-5 text-[11px] font-black text-white bg-slate-950 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform">Analyze Data</button>
          
          {mergedResult.length > 0 && (
            <div className="p-5 mt-6 border border-slate-100 bg-slate-50/50 rounded-3xl">
               <p className="text-[11px] font-bold text-slate-950 break-all leading-relaxed">
                 <span className="block mb-2 tracking-widest text-indigo-600 uppercase">Manual Result:</span>
                 {mergedResult.join(", ")}
               </p>
               <button onClick={() => { setExportSource("manual"); setShowDownloadModal(true); }} className="w-full mt-4 bg-white text-slate-900 font-black text-[9px] py-3 rounded-xl border border-slate-200 uppercase hover:bg-slate-950 hover:text-white transition-all">Generate Report</button>
            </div>
          )}
        </div>

        {/* 02. FILE IMPORTER */}
        <div className="bg-white/80 backdrop-blur-3xl p-7 rounded-[2.5rem] shadow-2xl border border-white">
          <h2 className="mb-5 text-[10px] font-black tracking-widest text-blue-700 uppercase">02. File Importer (Supports AC, BC, Box, etc.)</h2>
          <input type="file" accept=".txt" onChange={(e) => { const r = new FileReader(); r.onload = () => setTxtRaw(r.result); r.readAsText(e.target.files[0]); }} className="text-[10px] w-full mb-5 font-bold text-slate-500 file:bg-slate-100 file:border-0 file:rounded-full file:px-5 file:py-2 file:text-slate-950 file:font-black" />
          {txtRaw && <button onClick={() => { setExportSource("file"); setShowDownloadModal(true); }} className="w-full py-5 text-[10px] font-black text-white bg-blue-600 rounded-2xl uppercase shadow-lg active:scale-95 transition-transform">Process File Results</button>}
        </div>

        {/* 03. VISUAL SCANNER */}
        <div className="bg-white/80 backdrop-blur-3xl p-7 rounded-[2.5rem] shadow-2xl border border-white">
          <h2 className="mb-5 text-[10px] font-black tracking-widest text-purple-700 uppercase">03. Visual Scanner</h2>
          <button onClick={() => imageInputRef.current.click()} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40 text-slate-500 font-bold text-[10px] uppercase mb-5 hover:bg-white transition-all">+ Select Images</button>
          <input type="file" ref={imageInputRef} multiple accept="image/*" className="hidden" onChange={(e) => {
            const f = Array.from(e.target.files);
            setImages(p => [...p, ...f]);
            setImagePreviews(p => [...p, ...f.map(i => URL.createObjectURL(i))]);
          }} />

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-5">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative h-16 overflow-hidden border rounded-xl border-slate-100 group">
                  <img src={src} className="object-cover w-full h-full" />
                  <button onClick={() => { setImages(images.filter((_, idx) => idx !== i)); setImagePreviews(imagePreviews.filter((_, idx) => idx !== i)); }} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">Remove</button>
                </div>
              ))}
            </div>
          )}

          <button onClick={runVisualScan} className="w-full py-5 text-[10px] font-black text-white bg-purple-700 rounded-2xl disabled:bg-slate-200 uppercase shadow-lg active:scale-95 transition-transform" disabled={imageLoading}>
            {imageLoading ? `Scanning... ${scanProgress}%` : `Process ${images.length} Images`}
          </button>

          {imageResult.length > 0 && (
            <div className="p-5 mt-6 border border-purple-100 bg-purple-50/50 rounded-3xl">
               <p className="text-[11px] font-bold text-slate-950 break-all leading-relaxed">
                 <span className="block mb-2 tracking-widest text-purple-600 uppercase">Scanned Data:</span>
                 {imageResult.join(", ")}
               </p>
               <button onClick={() => { setExportSource("image"); setShowDownloadModal(true); }} className="w-full mt-4 bg-white text-purple-700 font-black text-[9px] py-3 rounded-xl border border-purple-200 uppercase">Export Scan</button>
            </div>
          )}
        </div>

        <button onClick={() => window.location.reload()} className="w-full py-4 text-[10px] font-black tracking-[0.4em] text-slate-400 bg-white/40 border border-white rounded-[2rem] uppercase mt-12 hover:text-red-600 transition-all">Flush Application Cache</button>
      </div>

      {/* EXPORT MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xs p-10 text-center border border-white">
            <h3 className="mb-2 text-xl font-black tracking-tight uppercase text-slate-900">Export Data</h3>
            <p className="text-[9px] text-slate-500 font-bold mb-8 uppercase tracking-[0.3em]">Select Format</p>
            <div className="space-y-4">
              <button onClick={() => handleExport("pdf")} className="w-full p-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform">PDF DOCUMENT</button>
              <button onClick={() => handleExport("excel")} className="w-full p-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-transform">EXCEL DATA</button>
            </div>
            <button onClick={() => setShowDownloadModal(false)} className="mt-8 text-red-500 text-[10px] font-black uppercase tracking-widest">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}