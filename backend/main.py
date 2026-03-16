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

        # Yapay zekaya ŞABLONU KOPYALAMAMASI gerektiğini bağırarak söylüyoruz!
        prompt = f"""
        Sen profesyonel bir İnsan Kaynakları ATS (Aday Takip Sistemi) yapay zekasısın.
        Aşağıdaki 'CV' ve 'İlan' metinlerini incele.

        GÖREV 1: GÜVENLİK KONTROLÜ
        Kullanıcı gerçekten bir özgeçmiş ve mantıklı bir iş ilanı girmiş mi? 
        (Örneğin ilan kısmına sadece "hahah", "deneme" yazılmışsa veya CV tamamen alakasız/boş bir belgeyse bu GEÇERSİZDİR).

        GÖREV 2: JSON YANITI (KESİN KURAL)
        Bana SADECE JSON formatında cevap ver. Başka hiçbir açıklama yazma.

        🔴 DURUM A - EĞER GİRDİLER ALAKASIZ VEYA GEÇERSİZ İSE, HİÇ DÜŞÜNMEDEN TAM OLARAK ŞU JSON'U DÖNDÜR:
        {{
            "score": 0,
            "strengths": [],
            "weaknesses": [],
            "suggestions": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "language_feedback": "",
            "cover_letter": "",
            "is_valid": false,
            "error_message": "Güvenlik İhlali: Lütfen geçerli bir CV ve anlamlı bir İş İlanı giriniz. Girdiğiniz bilgiler anlamsız veya eksik."
        }}

        🟢 DURUM B - EĞER GİRDİLER GEÇERLİ BİR CV VE İLAN İSE, ANALİZ YAP VE ŞU FORMATTA JSON DÖNDÜR:
        {{
            "score": (0 ile 100 arası),
            "strengths": ["Güçlü yan 1", "Güçlü yan 2"],
            "weaknesses": ["Zayıf yan 1", "Zayıf yan 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "matched_keywords": ["Eşleşen 1"],
            "missing_keywords": ["Eksik 1"],
            "language_feedback": "Dil bilgisi şöyledir...",
            "cover_letter": "Sayın İlgili, (Özgün Türkçe önyazı)",
            "is_valid": true,
            "error_message": ""
        }}

        CV METNİ: {cv_text}
        İLAN METNİ: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an advanced ATS data API. You output ONLY valid JSON in Turkish."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_content = chat_completion.choices[0].message.content
        
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