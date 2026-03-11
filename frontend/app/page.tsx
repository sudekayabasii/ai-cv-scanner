"use client";
import React, { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail, ShieldAlert, Loader2 } from "lucide-react";

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

  // DİKKAT: Buradaki linki Render Dashboard'daki linkinle DEĞİŞTİR!
  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    console.log("1. Analiz butona basıldı!"); // Takip için
    
    if (!file) {
      alert("Lütfen bir PDF dosyası seçin!");
      return;
    }
    
    setLoading(true);
    setData(null); 
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    console.log("2. İstek gönderiliyor: ", "https://dashboard.render.com/web/srv-d6ni77ua2pns738te1s0/analyze-cv");

    try {
      const res = await fetch(BACKEND_URL, { 
        method: "POST", 
        body: formData 
      });
      
      console.log("3. Sunucudan cevap geldi, durum kodu:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Sunucu hatası: ${res.status} - ${errorText}`);
      }
      
      const result: AnalysisData = await res.json();
      console.log("4. Veri başarıyla işlendi:", result);
      setData(result);
    } catch (e: any) {
      console.error("!!! HATA OLUŞTU:", e.message);
      alert("Hata: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log("Dosya seçildi:", e.target.files[0].name);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200 text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600 font-medium">CV&apos;nizi saniyeler içinde ATS uyumlu hale getirin.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800">
               <FileText className="text-blue-500" size={20}/> CV Yükleyin (PDF)
             </label>
             <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="w-full text-sm text-slate-600 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-4 file:py-2 file:font-semibold cursor-pointer"
             />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800">
               <Target className="text-red-500" size={20}/> Hedef İş Tanımı
             </label>
             <textarea 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                placeholder="İş ilanını buraya yapıştırın..." 
                className="w-full h-24 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white text-sm"
             />
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 mb-12 text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="animate-spin" size={20}/> Yapay Zeka İnceliyor...</>
          ) : (
            <><Trophy size={20}/> Analizi Başlat</>
          )}
        </button>

        {data && data.is_valid === false && (
          <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl mb-8 text-center animate-in fade-in">
             <ShieldAlert size={48} className="mx-auto text-red-600 mb-4" />
             <h3 className="text-2xl font-bold text-red-800 mb-2">Geçersiz Giriş!</h3>
             <p className="text-red-600 font-medium">{data.error_message}</p>
          </div>
        )}

        {data && data.is_valid !== false && data.score !== undefined && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 text-center">
              <div className="text-7xl font-black text-blue-600 mb-2">{data.score}%</div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Uyumluluk</p>
              <div className="w-full bg-slate-100 h-4 rounded-full mt-6 overflow-hidden border border-slate-200">
                <div className="bg-blue-600 h-full" style={{ width: `${data.score}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-4"><CheckCircle size={20}/> Güçlü Yanlar</h3>
                <ul className="space-y-2">
                  {data.strengths?.map((s, i) => <li key={i} className="text-emerald-700 text-sm leading-relaxed">• {s}</li>)}
                </ul>
              </div>
              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold mb-4"><AlertCircle size={20}/> Zayıf Yanlar</h3>
                <ul className="space-y-2">
                  {data.weaknesses?.map((w, i) => <li key={i} className="text-rose-700 text-sm leading-relaxed">• {w}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
              <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-4 text-xl"><Lightbulb className="text-yellow-500" /> Öneriler</h3>
              <div className="grid gap-4">
                {data.suggestions?.map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-slate-700 text-sm font-medium">{s}</div>
                ))}
              </div>
            </div>

            {data.cover_letter && (
              <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                <h3 className="flex items-center gap-2 text-indigo-900 font-bold text-xl mb-4"><Mail className="text-indigo-500" /> Önyazı</h3>
                <div className="p-6 bg-white rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {data.cover_letter}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-16 pt-8 border-t text-center text-xs text-slate-400">
        <p>Geliştirici: <span className="font-bold text-slate-600">Sude Kayabaşı</span> <Heart size={12} className="inline text-rose-400" /> | © 2026</p>
      </footer>
    </div>
  );
}