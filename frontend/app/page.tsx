"use client";
import React, { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail, ShieldAlert } from "lucide-react";

interface AnalysisData {
  is_valid?: boolean;
  error_message?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  cover_letter?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ÖNEMLİ: Linkin sonundaki /analyze-cv kısmını unutma!
  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      alert("Lütfen hem CV yükleyin hem de iş tanımını girin!");
      return;
    }
    setLoading(true);
    setData(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert("Bağlantı hatası! Sunucu uyanıyor olabilir, lütfen 1 dakika sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-xl text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">AI Talent Scanner 🚀</h1>
          <p className="text-slate-400">CV&apos;nizi saniyeler içinde analiz edin.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <label className="block font-bold mb-4 flex items-center gap-2"><FileText size={20}/> CV Seç (PDF)</label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400" />
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <label className="block font-bold mb-4 flex items-center gap-2"><Target size={20}/> İş Tanımı</label>
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="İlanı yapıştırın..." />
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold text-lg transition-all disabled:opacity-50">
          {loading ? "Yapay Zeka İnceliyor..." : "Analizi Başlat"}
        </button>

        {data?.is_valid === false && (
          <div className="mt-8 bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center">
            <ShieldAlert className="mx-auto text-red-500 mb-2" size={40} />
            <p className="text-red-200">{data.error_message}</p>
          </div>
        )}

        {data?.is_valid && (
          <div className="mt-12 space-y-6">
            <div className="bg-slate-800 p-8 rounded-3xl text-center border border-slate-700">
              <div className="text-6xl font-black text-blue-500 mb-2">{data.score}%</div>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Uyumluluk Skoru</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-900/20 p-6 rounded-2xl border border-emerald-500/30">
                <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle size={18}/> Güçlü Yanlar</h3>
                <ul className="text-sm space-y-2 text-emerald-100">
                  {data.strengths?.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="bg-rose-900/20 p-6 rounded-2xl border border-rose-500/30">
                <h3 className="font-bold text-rose-400 mb-4 flex items-center gap-2"><AlertCircle size={18}/> Eksikler</h3>
                <ul className="text-sm space-y-2 text-rose-100">
                  {data.weaknesses?.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            </div>

            {data.cover_letter && (
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2"><Mail size={18}/> Önyazı</h3>
                <div className="bg-slate-900 p-4 rounded-xl text-sm text-slate-300 whitespace-pre-wrap">{data.cover_letter}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="text-center mt-12 text-slate-500 text-sm">
        Geliştirici: Sude Kayabaşı <Heart size={14} className="inline text-rose-500" />
      </footer>
    </div>
  );
}