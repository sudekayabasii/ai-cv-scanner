"use client";
import { useState } from "react";
import { CheckCircle, AlertCircle, Lightbulb, Target, FileText, Trophy, Zap } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Render'daki canlı backend adresin
  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    if (!file) return alert("Lütfen bir PDF dosyası seçin!");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      const res = await fetch(BACKEND_URL, { 
        method: "POST", 
        body: formData 
      });
      
      if (!res.ok) throw new Error("Sunucu yanıt vermedi");
      
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert("Hata: Analiz tamamlanamadı. Backend uyanıyor olabilir, lütfen 30 saniye sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Başlık Alanı */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200 text-white">
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">AI Talent Scanner</h1>
          <p className="text-slate-600 font-medium">CV'nizi saniyeler içinde ATS uyumlu hale getirin.</p>
        </header>

        {/* Giriş Panelleri */}
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

        {/* Analiz Butonu */}
        <button 
          onClick={handleAnalyze} 
          disabled={loading} 
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 mb-12 text-lg flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? "Yapay Zeka İnceliyor..." : <><Trophy size={20}/> Analizi Başlat</>}
        </button>

        {/* Analiz Sonuçları */}
        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Skor Kartı */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 text-center">
              <div className="text-7xl font-black text-blue-600 mb-2">{data.score}%</div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Genel Uyumluluk</p>
              <div className="w-full bg-slate-100 h-4 rounded-full mt-6 overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-full transition-all duration-1000" 
                  style={{ width: `${data.score}%` }}
                ></div>
              </div>
            </div>

            {/* Güçlü ve Zayıf Yanlar Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                <h3 className="flex items-center gap-2 text-emerald-800 font-bold mb-4"><CheckCircle size={20}/> Güçlü Yanlar</h3>
                <ul className="space-y-2">
                  {data.strengths.map((s: any, i: number) => (
                    <li key={i} className="text-emerald-700 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                <h3 className="flex items-center gap-2 text-rose-800 font-bold mb-4"><AlertCircle size={20}/> Gelişim Alanları</h3>
                <ul className="space-y-2">
                  {data.weaknesses.map((w: any, i: number) => (
                    <li key={i} className="text-rose-700 text-sm flex items-start gap-2 font-medium leading-relaxed">
                      <span className="shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Öneriler Listesi */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
              <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-6 text-xl">
                <Lightbulb className="text-yellow-500" size={24}/> Yapay Zeka Strateji Önerileri
              </h3>
              <div className="grid gap-4">
                {data.suggestions.map((s: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed border-l-4 border-l-blue-600 font-medium">
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}