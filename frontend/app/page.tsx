"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    if (!file) return alert("Lütfen bir PDF dosyası seçin!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert("Hata: Analiz tamamlanamadı. Lütfen biraz bekleyip tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex flex-col font-sans">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600 font-medium text-lg">CV&apos;nizi saniyeler içinde ATS uyumlu hale getirin.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800 text-lg">
               <FileText className="text-blue-500" size={24}/> CV Yükleyin (PDF)
             </label>
             <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-xl file:px-4 file:py-2 file:font-bold" />
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800 text-lg">
               <Target className="text-rose-500" size={24}/> Hedef İş Tanımı
             </label>
             <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="İş ilanını buraya yapıştırın..." className="w-full h-24 p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-50 text-sm" />
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl transition-all shadow-xl disabled:opacity-50 text-xl flex items-center justify-center gap-3">
          {loading ? "Yapay Zeka Analiz Ediyor..." : <><Trophy size={24}/> ANALİZİ BAŞLAT</>}
        </button>

        {data && (
          <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Skor Kartı */}
            <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
              <div className="text-8xl font-black text-blue-600 mb-2">{data.score}%</div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Genel Uyumluluk</p>
            </div>

            {/* Güçlü ve Zayıf Yanlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold text-xl mb-6"><CheckCircle size={24}/> Güçlü Yanlar</h3>
                <ul className="space-y-3 text-emerald-700 font-medium">
                  {data.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold text-xl mb-6"><AlertCircle size={24}/> Gelişim Alanları</h3>
                <ul className="space-y-3 text-rose-700 font-medium">
                  {data.weaknesses?.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            </div>

            {/* Önyazı Kısmı */}
            {data.cover_letter && (
              <div className="bg-white p-8 rounded-[40px] shadow-lg border border-slate-200">
                <h3 className="flex items-center gap-3 text-slate-800 font-bold text-2xl mb-6"><Mail className="text-blue-500" /> Profesyonel Önyazı</h3>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                  {data.cover_letter}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full max-w-4xl mx-auto mt-20 pt-8 border-t border-slate-200 text-center text-slate-400">
        <p className="font-bold flex items-center justify-center gap-2">
          Geliştirici: <span className="text-slate-900 underline decoration-blue-500 underline-offset-4">Sude Kayabaşı</span>
          <Heart size={16} className="text-rose-500 fill-rose-500" /> | © 2026
        </p>
      </footer>
    </div>
  );
}