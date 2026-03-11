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

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.get("/")
def read_root():
    return {"message": "CV Analiz API Calisiyor!"}

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        cv_text = ""
        for page in pdf_reader.pages:
            cv_text += page.extract_text()

        prompt = f"""
        Sen son derece acımasız, kuralcı ve analitik bir İK Yöneticisisin. 
        Aşağıda sana bir 'Belge Metni' ve 'İş Tanımı' veriyorum.

        GÖREV 1 - SAHTEKARLIK KONTROLÜ:
        - Belge metni gerçekten bir CV mi? (Eğitim, deneyim yoksa CV DEĞİLDİR).
        - İş Tanımı mantıklı mı? (Sadece harf yığınlarıysa GEÇERSİZDİR).

        EĞER SAÇMAYSA VEYA CV DEĞİLSE SADECE ŞU JSON'U DÖNDÜR:
        {{
            "is_valid": false,
            "error_message": "Sisteme anlamsız bir belge veya geçersiz bir iş tanımı yüklediniz."
        }}

        GÖREV 2 - HASSAS ANALİZ VE PUANLAMA:
        Eğer veriler geçerliyse, tam analiz yap. PUANLAMA (score) İÇİN KATI KURALLAR:
        1. Anahtar kelimeleri ve deneyim yıllarını eşleştirerek matematiksel bir oran çıkar.
        2. ASLA 80, 85, 90, 95 gibi yuvarlak ve ezbere sayılar verme! İş ilanına tam uymuyorsa acımasızca 34, 47, 58 gibi düşük puanlar ver. Uyumluysa 73, 82, 91 gibi spesifik küsuratlı sayılar ver.
        
        SADECE şu formattaki geçerli JSON'u döndür (Kopya çekme, score kısmına KENDİ HESAPLADIĞIN spesifik bir tam sayı yaz!):
        {{
            "is_valid": true,
            "score": [BURAYA_HESAPLADIĞIN_SPESİFİK_SAYIYI_YAZ_ÖRNEĞİN_63], 
            "strengths": ["Güçlü yan 1", "Güçlü yan 2"],
            "weaknesses": ["Zayıf yan 1", "Zayıf yan 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "cover_letter": "Bu iş için adayın neden uygun olduğunu anlatan profesyonel önyazı."
        }}

        Belge Metni: {cv_text}
        
        İş Tanımı: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.2 # Biraz yaratıcılık ekledik ki matematiği daha iyi yapsın
        )

        result_text = chat_completion.choices[0].message.content
        
        start_idx = result_text.find('{')
        end_idx = result_text.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = result_text[start_idx:end_idx]
        else:
            json_str = result_text
            
        result = json.loads(json_str)
        return result
    except Exception as e:
        return {"error": str(e)}