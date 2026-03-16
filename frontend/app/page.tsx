"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail, ShieldAlert, Check, X, MessageSquare, Search, Download, Moon, Sun } from "lucide-react";

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
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Karanlık Mod Kontrolü
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-slate-950 transition-colors duration-300 print:bg-white py-12 print:py-0 px-4 flex flex-col font-sans">
      <div className="max-w-4xl mx-auto flex-grow w-full relative">
        
        {/* Gece Modu Butonu */}
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="absolute right-0 top-0 p-3 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-yellow-400 shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform print:hidden"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        <header className="text-center mb-12 print:mb-6 pt-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 dark:bg-blue-500 rounded-2xl mb-4 shadow-lg shadow-blue-200 dark:shadow-none text-white print:shadow-none transition-colors">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium print:hidden">CV&apos;nizi saniyeler içinde ATS uyumlu hale getirin.</p>
        </header>

        {/* Giriş Alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-slate-200">
               <FileText className="text-blue-500 dark:text-blue-400" size={20}/> CV Yükleyin (PDF)
             </label>
             <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="w-full text-sm text-slate-600 dark:text-slate-400 file:bg-blue-50 dark:file:bg-slate-800 file:text-blue-700 dark:file:text-blue-400 file:border-0 file:rounded-lg file:px-4 file:py-2 file:font-semibold cursor-pointer"
             />
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800 dark:text-slate-200">
               <Target className="text-red-500 dark:text-red-400" size={20}/> Hedef İş Tanımı
             </label>
             <textarea 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                placeholder="İş ilanını buraya yapıştırın..." 
                className="w-full h-24 p-3 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 text-sm"
             />
          </div>
        </div>

        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 mb-12 text-lg flex items-center justify-center gap-2 print:hidden"
        >
          {loading ? "Yapay Zeka İnceliyor..." : <><Trophy size={20}/> Analizi Başlat</>}
        </button>

        {/* --- 🛡️ GÜVENLİK KALKANI (ARTIK ÖNCELİKLİ) --- */}
        {data && data.is_valid === false && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/50 p-8 rounded-3xl mb-8 shadow-sm text-center animate-in fade-in zoom-in duration-300">
             <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/40 rounded-full mb-4 text-red-600 dark:text-red-400">
               <ShieldAlert size={48} />
             </div>
             <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Güvenlik Kontrolüne Takıldınız!</h3>
             <p className="text-red-600 dark:text-red-400 font-medium text-lg">{data.error_message}</p>
          </div>
        )}

        {/* --- ✅ SONUÇLAR (SADECE HATA YOKSA GÖRÜNÜR) --- */}
        {data && data.is_valid !== false && data.score !== undefined && (
          <div className="space-y-6">
            <div className="flex justify-end print:hidden">
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                <Download size={20} /> Sonuçları PDF Olarak İndir
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 text-center print:shadow-none print:border-slate-300">
              <div className="text-7xl font-black text-blue-600 dark:text-blue-400 mb-2">{data.score}%</div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Genel Uyumluluk</p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full mt-6 overflow-hidden border border-slate-200 dark:border-slate-700 print:border-slate-300">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 h-full transition-all duration-1000 print:bg-blue-600" 
                  style={{ width: `${data.score || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 print:shadow-none print:border-slate-300 print:break-inside-avoid">
              <h3 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold mb-6 text-xl">
                <Search className="text-indigo-500 dark:text-indigo-400" size={24}/> ATS Anahtar Kelime Radarı
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 print:border-slate-300">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 text-sm">
                    <Check size={18} className="text-emerald-500 dark:text-emerald-400"/> Bulunan Yetenekler
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.matched_keywords?.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 print:border-emerald-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 print:border-slate-300">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 text-sm">
                    <X size={18} className="text-rose-500 dark:text-rose-400"/> Eksik Yetenekler
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.missing_keywords?.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-100 dark:border-rose-800 line-through decoration-rose-300 dark:decoration-rose-500 print:border-rose-300">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 print:border-emerald-300">
                <h3 className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold mb-4"><CheckCircle size={20}/> Güçlü Yanlar</h3>
                <ul className="space-y-2">
                  {data.strengths?.map((s, i) => (
                    <li key={i} className="text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/50 print:border-rose-300">
                <h3 className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold mb-4"><AlertCircle size={20}/> Gelişim Alanları</h3>
                <ul className="space-y-2">
                  {data.weaknesses?.map((w, i) => (
                    <li key={i} className="text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {data.language_feedback && (
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-6 rounded-2xl border border-violet-100 dark:border-violet-800/50 shadow-sm print:shadow-none print:border-violet-300 print:break-inside-avoid">
                <h3 className="flex items-center gap-2 text-violet-800 dark:text-violet-400 font-bold mb-3">
                  <MessageSquare size={20} className="text-violet-500 dark:text-violet-400"/> Dil ve Profesyonellik Analizi
                </h3>
                <p className="text-violet-900 dark:text-violet-200 text-sm font-semibold leading-relaxed">
                  {data.language_feedback}
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 print:shadow-none print:border-slate-300 print:break-inside-avoid">
              <h3 className="flex items-center gap-2 text-slate-800 dark:text-white font-bold mb-6 text-xl">
                <Lightbulb className="text-yellow-500 dark:text-yellow-400" size={24}/> Yapay Zeka Strateji Önerileri
              </h3>
              <div className="grid gap-4">
                {data.suggestions?.map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm leading-relaxed border-l-4 border-l-blue-600 dark:border-l-blue-500 font-medium print:border-slate-300">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {data.cover_letter && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-8 rounded-3xl shadow-md border border-indigo-100 dark:border-indigo-800/50 print:shadow-none print:border-indigo-300 print:break-inside-avoid">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h3 className="flex items-center gap-2 text-indigo-900 dark:text-indigo-400 font-bold text-xl">
                    <Mail className="text-indigo-500 dark:text-indigo-400" size={24}/> Özel Önyazı (Cover Letter)
                  </h3>
                  <button 
                    onClick={handleCopy}
                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 print:hidden"
                  >
                    <FileText size={16}/> Metni Kopyala
                  </button>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-indigo-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap shadow-sm font-medium print:border-indigo-300">
                  {data.cover_letter}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="w-full max-w-4xl mx-auto mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-medium print:hidden">
        <p className="flex items-center justify-center gap-1.5">
          Geliştirici: <span className="font-bold text-slate-600 dark:text-slate-400">Sude Kayabaşı</span>
          <Heart size={12} className="text-rose-400 fill-rose-400" /> | © 2026
        </p>
      </footer>
    </div>
  );
}