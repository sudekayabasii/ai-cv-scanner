from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import os
from groq import Groq
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        api_key = os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)

        pdf_reader = PyPDF2.PdfReader(file.file)
        cv_text = ""
        for page in pdf_reader.pages:
            cv_text += page.extract_text() or ""

        # PROMPT 4.0: Önyazı Canavarı ve Güvenlik Duvarı
        # PROMPT 5.0: Hassas Skorlama ve Detaylı Analiz
        prompt = f"""
        Sen çok titiz bir Teknik İşe Alım Uzmanısın. 
        Aşağıdaki 'CV' ve 'İlan' metinlerini matematiksel bir kesinlikle analiz et.

        1. GÜVENLİK KONTROLÜ:
        - Eğer girdiler anlamsızsa (örn: 'hahah') direkt 'is_valid': false döndür.

        2. SKORLAMA ALGORİTMASI (ÇOK HASSAS):
        Skoru (score) şu kriterlere göre 0-100 arası hesapla:
        - %50 Anahtar Kelime Uyumu: İlandaki teknik terimlerin CV'de tam karşılığı var mı?
        - %30 Deneyim Uyumu: İstenen sorumluluklar CV'deki geçmişle örtüşüyor mu?
        - %20 Dil ve Sunum: Profesyonellik ve akademik standartlar.
        NOT: Eğer CV ile ilan tamamen alakasızsa 20-30 puanı geçme. Sadece mükemmel eşleşmelere 90+ ver.

        3. ÖNYAZI (COVER LETTER):
        - En az 4 paragraf, çok profesyonel, aday özelinde ve ikna edici bir metin yaz.

        CEVAP FORMATI (JSON):
        {{
            "score": (Hesapladığın hassas skor),
            "strengths": ["..."],
            "weaknesses": ["..."],
            "suggestions": ["..."],
            "matched_keywords": ["..."],
            "missing_keywords": ["..."],
            "language_feedback": "Neden bu puanı verdiğini açıklayan kısa bir not.",
            "cover_letter": "Sayın İşe Alım Yöneticisi...",
            "is_valid": true,
            "error_message": ""
        }}

        CV: {cv_text}
        İlan: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a senior HR consultant. You must output ONLY valid JSON in Turkish."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3, # Biraz yaratıcılık ekledik ki yazı kalitesi artsın
            response_format={"type": "json_object"}
        )
        
        raw_content = chat_completion.choices[0].message.content
        
        # JSON temizleme ve parse etme
        start_index = raw_content.find('{')
        end_index = raw_content.rfind('}')
        
        if start_index != -1 and end_index != -1:
            cleaned_content = raw_content[start_index:end_index+1]
            result = json.loads(cleaned_content)
            return result
        else:
            return {"error": "Yapay zeka JSON formatında yanıt vermedi.", "ai_gizli_cevap": raw_content}

    except Exception as e:
        return {"error": f"Sistem Hatası: {str(e)}"}