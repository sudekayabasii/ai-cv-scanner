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
        prompt = f"""
        Sen seçkin bir Kariyer Danışmanı ve Kıdemli İK Uzmanısın.
        Aşağıdaki 'CV' ve 'İlan' metinlerini derinlemesine analiz et.

        GÖREV 1: GÜVENLİK SÜZGECİ
        Metinleri oku. Eğer CV metni veya İş İlanı anlamsızsa, çok kısaysa (Örn: sadece 'hahah', 'deneme', 'asdasd' gibi), veya bir özgeçmiş formatında değilse;
        HİÇBİR ANALİZ YAPMA. Direkt 'is_valid': false döndür.

        GÖREV 2: ANALİZ VE ÖNYAZI (SADECE GİRDİLER GEÇERLİ SE)
        Eğer her şey yolundaysa, adayı işe aldıracak kadar güçlü bir analiz yap.
        ÖZELLİKLE "cover_letter" İÇİN TALİMATLAR:
        - Metin en az 250-300 kelime olmalı.
        - Asla kısa kesme, 4 paragraflık tam bir mektup oluştur.
        - İlk paragrafta heyecanını belirt, orta paragraflarda CV'deki teknik başarıları işle, son paragrafta mülakat talebiyle bitir.
        - Dil: Çok profesyonel, kurumsal ve ikna edici bir Türkçe.

        CEVAP FORMATI (KESİNLİKLE JSON):
        {{
            "score": (0-100),
            "strengths": ["Güçlü madde 1", "Güçlü madde 2"],
            "weaknesses": ["Zayıf madde 1", "Zayıf madde 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "matched_keywords": ["Kelime 1", "Kelime 2"],
            "missing_keywords": ["Kelime 3", "Kelime 4"],
            "language_feedback": "Dil kalitesi hakkında detaylı yorum.",
            "cover_letter": "Sayın İşe Alım Yöneticisi, \\n\\n[Buraya çok uzun ve etkileyici bir mektup yaz...]",
            "is_valid": true,
            "error_message": ""
        }}

        CV METNİ: {cv_text}
        İLAN METNİ: {job_description}
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