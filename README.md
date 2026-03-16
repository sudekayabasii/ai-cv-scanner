# 🚀 AI Talent Scanner

AI Talent Scanner, adayların özgeçmişlerini (CV) hedef iş ilanlarıyla karşılaştıran, yapay zeka tabanlı profesyonel bir **ATS (Applicant Tracking System)** analiz aracıdır. Bu proje, adayların iş başvurularında öne çıkmalarını sağlamak için tasarlanmış bir **Full-Stack SaaS** örneğidir.

🔗 **Canlı Demo:** [https://ai-cv-scanner.vercel.app/](https://ai-cv-scanner.vercel.app/)

## ✨ Temel Özellikler

- 📊 **Hassas Skorlama:** CV ve İş Tanımı arasındaki uyumu %50 Anahtar Kelime, %30 Deneyim ve %20 Dil kalitesi ağırlığıyla hesaplayan özel algoritma.
- 🛡️ **AI Güvenlik Kalkanı:** Geçersiz veya anlamsız (spam) girdileri tespit edip filtreleyen akıllı doğrulama sistemi.
- 📝 **Profesyonel Önyazı (Cover Letter):** Adayın yeteneklerini iş ilanıyla harmanlayan, 4 paragraf uzunluğunda, ikna edici önyazı üretimi.
- 📄 **PDF Raporlama:** Analiz sonuçlarını ve hazırlanan önyazıyı tek tıkla profesyonel bir A4 raporu olarak indirme imkanı.
- 🌙 **Modern UI & Dark Mode:** Tailwind CSS v4 kullanılarak hazırlanan, sistem tercihlerine duyarlı dinamik kullanıcı arayüzü.

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Deployment:** Vercel

### Backend
- **Language:** Python 3.10+
- **Framework:** FastAPI
- **Library:** PyPDF2 (PDF Metin İşleme)
- **Deployment:** Render

### Yapay Zeka (AI)
- **LLM:** Llama 3.1 (8B)
- **API:** Groq Cloud API

## 🚀 Kurulum ve Çalıştırma

### Backend
1. Python yüklü olduğundan emin olun.
2. `pip install -r requirements.txt` ile bağımlılıkları yükleyin.
3. `GROQ_API_KEY` environment variable'ı ekleyin.
4. `uvicorn main:app --reload` ile sunucuyu başlatın.

### Frontend
1. `npm install` ile paketleri yükleyin.
2. `npm run dev` ile projeyi yerelde ayağa kaldırın.

---
Geliştirici: **Sude Kayabaşı** ❤️  
*Bu proje, modern web teknolojileri ve yapay zeka entegrasyonu üzerine bir vaka çalışması olarak geliştirilmiştir.*
