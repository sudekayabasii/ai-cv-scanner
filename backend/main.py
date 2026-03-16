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
        Aşağıdaki CV'yi ve İş İlanını profesyonel bir İnsan Kaynakları (ATS) sistemi gibi analiz et.
        ÖNEMLİ KURALLAR:
        1. BANA SADECE VE KESİNLİKLE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER.
        2. TÜM CEVAPLARI KESİNLİKLE TÜRKÇE DİLİNDE YAZ.
        3. "matched_keywords" kısmına ilanda istenen ve CV'de bulunan anahtar kelimeleri yaz.
        4. "missing_keywords" kısmına ilanda istenen ama CV'de EKSİK olan anahtar kelimeleri yaz.
        5. "language_feedback" kısmına CV'nin dil bilgisi, profesyonelliği ve akıcılığı hakkında 1-2 cümlelik yapıcı bir eleştiri yaz.
        6. EN ÖNEMLİSİ: "cover_letter" kısmındaki metni KOPYALAMA! Adayın CV'sini ve ilanı harmanlayarak, senin ürettiğin UZUN, ÖZGÜN VE PROFESYONEL BİR TÜRKÇE ÖNYAZI yaz!
        
        {{
            "score": (0 ile 100 arası bir sayı),
            "strengths": ["Türkçe güçlü yan 1", "Türkçe güçlü yan 2"],
            "weaknesses": ["Türkçe zayıf yan 1", "Türkçe zayıf yan 2"],
            "suggestions": ["Türkçe öneri 1", "Türkçe öneri 2"],
            "matched_keywords": ["Kelime 1", "Kelime 2"],
            "missing_keywords": ["Kelime 3", "Kelime 4"],
            "language_feedback": "Dil değerlendirmesi",
            "cover_letter": "(BU KISMA SENİN YAZDIĞIN YEPYENİ VE UZUN BİR ÖNYAZI GELECEK. Şablonu kopyalama, kendin yaz.)",
            "is_valid": true,
            "error_message": ""
        }}

        CV: {cv_text}
        İlan: {job_description}
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