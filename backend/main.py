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

        # PDF Okuma
        pdf_reader = PyPDF2.PdfReader(file.file)
        cv_text = ""
        for page in pdf_reader.pages:
            cv_text += page.extract_text() or ""

        # Yapay zekaya kaçış yolu bırakmayan o sert komut
        prompt = f"""
        Aşağıdaki CV'yi ve İş İlanını analiz et. 
        BANA SADECE VE KESİNLİKLE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER. BAŞKA HİÇBİR KELİME, SELAM VEYA AÇIKLAMA YAZMA.
        
        {{
            "score": (0 ile 100 arası bir sayı),
            "strengths": ["güçlü yan 1", "güçlü yan 2"],
            "weaknesses": ["zayıf yan 1", "zayıf yan 2"],
            "suggestions": ["öneri 1", "öneri 2"],
            "cover_letter": "Örnek önyazı metni",
            "is_valid": true,
            "error_message": ""
        }}

        CV: {cv_text}
        İlan: {job_description}
        """

        # Yapay zekanın çenesini kapatan o sihirli "json_object" komutu
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a strict data API. You output ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        raw_content = chat_completion.choices[0].message.content
        
        # İşimi yine de sağlama alıyorum
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