"use client";
import React, { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap, Heart, Mail, ShieldAlert, Loader2 } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
      console.log("Gelen Veri:", result);

      // EĞER BACKEND HATA DÖNDÜRDÜYSE
      if (result.error) {
        alert("Sistem Hatası: " + result.error);
        setLoading(false);
        return;
      }

      setData(result);
    } catch (e) {
      alert("Bağlantı Hatası! Lütfen internetinizi ve Render linkinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <header className="text-center mb-12">
          <div className="inline-flex p-3 bg-blue-600 rounded-2xl mb-4 text-white shadow-lg shadow-blue-200">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600">CV ve İş İlanı Uyumluluk Analizi</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800"><FileText className="text-blue-500" size={20}/> CV (PDF)</label>
             <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm cursor-pointer"/>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <label className="flex items-center gap-2 font-bold mb-4 text-slate-800"><Target className="text-red-500" size={20}/> İş Tanımı</label>
             <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="İş ilanını buraya yapıştırın..." className="w-full h-24 p-3 border rounded-xl outline-none text-sm"/>
          </div>
        </div>

        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 mb-12 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={20}/> İnceleniyor...</> : <><Trophy size={20}/> Analizi Başlat</>}
        </button>

        {/* ANALİZ SONUCU BURADA GÖRÜNECEK */}
        {data && (
          <div className="space-y-6 animate-in fade-in">
            {data.is_valid === false ? (
              <div className="bg-red-50 border-2 border-red-200 p-8 rounded-3xl text-center">
                <ShieldAlert size={48} className="mx-auto text-red-600 mb-4" />
                <h3 className="text-2xl font-bold text-red-800 mb-2">Hatalı Giriş!</h3>
                <p className="text-red-600 font-medium">{data.error_message}</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 text-center">
                  <div className="text-7xl font-black text-blue-600 mb-2">{data.score}%</div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Uyumluluk Skoru</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="text-emerald-800 font-bold mb-4">Güçlü Yanlar</h3>
                    <ul className="space-y-2 text-sm text-emerald-700 font-medium">
                      {data.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                    <h3 className="text-rose-800 font-bold mb-4">Gelişim Alanları</h3>
                    <ul className="space-y-2 text-sm text-rose-700 font-medium">
                      {data.weaknesses?.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
                  <h3 className="font-bold mb-4 text-xl">Stratejik Öneriler</h3>
                  <div className="grid gap-4">
                    {data.suggestions?.map((s: string, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-600 text-slate-700 text-sm font-medium">{s}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
                  <h3 className="font-bold text-xl mb-4 text-indigo-900">Özel Önyazı</h3>
                  <div className="p-6 bg-white rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{data.cover_letter}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}