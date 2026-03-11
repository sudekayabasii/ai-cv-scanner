"use client";
import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://cv-analiz-backend-o3je.onrender.com/analyze-cv";

  const handleAnalyze = async () => {
    if (!file || !jobDescription) return alert("Eksik bilgi!");
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file); // Backend 'file' bekliyor
    formData.append("job_description", jobDescription); // Backend 'job_description' bekliyor

    try {
      const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
      const result = await res.json();
      setData(result);
    } catch (e) {
      alert("Hata!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-5">AI Talent Scanner 🚀</h1>
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 block" />
      <textarea 
        placeholder="İş ilanı..." 
        value={jobDescription} 
        onChange={(e) => setJobDescription(e.target.value)}
        className="w-full h-32 p-3 border rounded mb-4"
      />
      <button onClick={handleAnalyze} disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded">
        {loading ? "Analiz Ediliyor..." : "Analizi Başlat"}
      </button>

      {data && (
        <div className="mt-10 p-5 bg-gray-100 rounded">
          <h2 className="font-bold text-xl mb-3">Sonuç: %{data.score}</h2>
          <p><strong>Önyazı:</strong> {data.cover_letter}</p>
        </div>
      )}
    </div>
  );
}