"use client";
import React, { useState } from "react";
// YENİ İKONLAR EKLENDİ (Check, X, MessageSquare, Search)
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail, ShieldAlert, Check, X, MessageSquare, Search } from "lucide-react";

// YENİ VERİ TİPLERİ EKLENDİ
interface AnalysisData {
  is_valid?: boolean;
  error_message?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  matched_keywords?: string[];
  missing_keywords?: string[];
  language_feedback?: string;
  cover_letter?: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    if (!file) {
      alert("Lütfen bir PDF dosyası seçin!");
      return;
    }
    setLoading(true);
    setData(null);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(BACKEND_URL, { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) throw new Error("Sunucu yanıt vermedi");
      
      const result: AnalysisData = await res.json();
      setData(result);
    } catch (e) {
      alert("Hata: Analiz tamamlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (data?.cover_letter) {
      navigator.clipboard.writeText(data.cover_letter);
      alert("Önyazı kopyalandı! 🎉");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 flex flex-col font-sans">
      <div className="max-w-4xl mx-auto flex-grow w-full">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200 text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600 font-medium">CV&apos;nizi saniyeler içinde ATS uyumlu hale getirin.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800">
               <FileText className="text-blue-500" size={20}/> CV Yükleyin (PDF)
             </label>
             <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full text-sm text-slate-600 file:bg-blue-50 file:text-blue-700 file:border-0 file:rounded-lg file:px-4 file:py-2 file:font-semibold cursor-pointer"
             />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800">
               <Target className="text-red-500" size={20}/> Hedef İş Tanımı
             </label>
             <textarea 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                placeholder="İş ilanını buraya yapıştırın..." 
                className="w-full h-24 p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white placeholder-slate-400 text-sm"
             />
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 mb-12 text-lg flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? "Yapay Zeka İnceliyor..." : <><Trophy size={20}/> Analizi Başlat</>}
        </button>

        {data && data.is_valid === false && (
          <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl mb-8 shadow-sm text-center">
             <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4 text-red-600">
               <ShieldAlert size={48} />
             </div>
             <h3 className="text-2xl font-bold text-red-800 mb-2">Güvenlik Kontrolüne Takıldınız!</h3>
             <p className="text-red-600 font-medium text-lg">{data.error_message}</p>
          </div>
        )}

        {data && data.is_valid !== false && data.score !== undefined && (
          <div className="space-y-6">
            
            {/* Skor Alanı */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 text-center">
              <div className="text-7xl font-black text-blue-600 mb-2">{data.score}%</div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Genel Uyumluluk</p>
              <div className="w-full bg-slate-100 h-4 rounded-full mt-6 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-1000" 
                  style={{ width: `${data.score || 0}%` }}
                ></div>
              </div>
            </div>

            {/* YENİ: ATS Anahtar Kelime Radarı */}
            {(data.matched_keywords?.length || data.missing_keywords?.length) ? (
              <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
                <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-6 text-xl">
                  <Search className="text-indigo-500" size={24}/> ATS Anahtar Kelime Radarı
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Eşleşenler */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                      <Check size={18} className="text-emerald-500"/> Bulunan Yetenekler
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.matched_keywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                          {kw}
                        </span>
                      ))}
                      {(!data.matched_keywords || data.matched_keywords.length === 0) && (
                        <span className="text-slate-400 text-xs italic font-medium">Eşleşen kelime bulunamadı.</span>
                      )}
                    </div>
                  </div>
                  {/* Eksikler */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                      <X size={18} className="text-rose-500"/> Eksik Yetenekler
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.missing_keywords?.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-100 line-through decoration-rose-300">
                          {kw}
                        </span>
                      ))}
                      {(!data.missing_keywords || data.missing_keywords.length === 0) && (
                        <span className="text-slate-400 text-xs italic font-medium">Eksik kelime yok, harika!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Güçlü ve Zayıf Yanlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-4"><CheckCircle size={20}/> Güçlü Yanlar</h3>
                <ul className="space-y-2">
                  {data.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-emerald-700 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold mb-4"><AlertCircle size={20}/> Gelişim Alanları</h3>
                <ul className="space-y-2">
                  {data.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-rose-700 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* YENİ: Dil ve Profesyonellik Analizi */}
            {data.language_feedback && (
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 rounded-2xl border border-violet-100 shadow-sm">
                <h3 className="flex items-center gap-2 text-violet-800 font-bold mb-3">
                  <MessageSquare size={20} className="text-violet-500"/> Dil ve Profesyonellik Analizi
                </h3>
                <p className="text-violet-900 text-sm font-semibold leading-relaxed">
                  {data.language_feedback}
                </p>
              </div>
            )}

            {/* Strateji Önerileri */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
              <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-6 text-xl">
                <Lightbulb className="text-yellow-500" size={24}/> Yapay Zeka Strateji Önerileri
              </h3>
              <div className="grid gap-4">
                {data.suggestions?.map((s: string, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed border-l-4 border-l-blue-600 font-medium">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Önyazı */}
            {data.cover_letter && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-3xl shadow-md border border-indigo-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="flex items-center gap-2 text-indigo-900 font-bold text-xl">
                    <Mail className="text-indigo-500" size={24}/> Özel Önyazı (Cover Letter)
                  </h3>
                  <button 
                    onClick={handleCopy}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <FileText size={16}/> Metni Kopyala
                  </button>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-indigo-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap shadow-sm font-medium">
                  {data.cover_letter}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
        <p className="flex items-center justify-center gap-1.5">
          Geliştirici: <span className="font-bold text-slate-600">Sude Kayabaşı</span>
          <Heart size={12} className="text-rose-400 fill-rose-400" /> | © 2026
        </p>
      </footer>
    </div>
  );
}